import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SummaryEngine } from './summary.engine';
import { InterviewQuestionEngine } from './interview.engine';
import { CareerGapsEngine } from './career-gaps.engine';
import { ComparisonEngine } from './comparison.engine';
import { RecommendationEngine } from './recommendation.engine';
import { ResumeParserEngine } from './resume-parser.engine';
import { RecruitingInsightsEngine } from './recruiting-insights.engine';
import { CandidateSource } from '@prisma/client';

@Injectable()
export class CopilotService {
  constructor(
    private prisma: PrismaService,
    private summaryEngine: SummaryEngine,
    private interviewEngine: InterviewQuestionEngine,
    private careerGapsEngine: CareerGapsEngine,
    private comparisonEngine: ComparisonEngine,
    private recommendationEngine: RecommendationEngine,
    private resumeParser: ResumeParserEngine,
    private recruitingInsightsEngine: RecruitingInsightsEngine,
  ) {}

  async getCandidateSummary(orgId: string, candidateId: string) {
    const candidate = await this.getCandidate(orgId, candidateId);
    return this.summaryEngine.generateCandidateSummary({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      yearsExperience: candidate.yearsExperience,
      education: candidate.education,
      skills: candidate.skills,
      experiences: candidate.experiences,
      applications: candidate.applications,
    });
  }

  async getCareerGaps(orgId: string, candidateId: string) {
    const candidate = await this.getCandidate(orgId, candidateId);
    return this.careerGapsEngine.detectCareerGaps(candidate.experiences);
  }

  async getHiringRecommendation(orgId: string, candidateId: string, applicationId?: string) {
    const candidate = await this.getCandidate(orgId, candidateId);
    const application = applicationId
      ? candidate.applications.find((a) => a.id === applicationId) ?? candidate.applications[0]
      : candidate.applications[0];

    return this.recommendationEngine.generateHiringRecommendation({
      yearsExperience: candidate.yearsExperience,
      skills: candidate.skills,
      experiences: candidate.experiences,
      application: application ?? null,
    });
  }

  async generateInterviewQuestions(orgId: string, candidateId: string, applicationId?: string) {
    const candidate = await this.getCandidate(orgId, candidateId);
    const application = applicationId
      ? candidate.applications.find((a) => a.id === applicationId) ?? candidate.applications[0]
      : candidate.applications[0];

    const jobTitle = application?.job.title ?? candidate.experiences[0]?.title ?? 'Software Engineer';
    const skills = candidate.skills.map((s) => s.name);

    return this.interviewEngine.generateInterviewQuestions(jobTitle, skills);
  }

  async compareCandidates(orgId: string, candidateIds: string[]) {
    const candidates = await this.prisma.candidate.findMany({
      where: { organizationId: orgId, id: { in: candidateIds } },
      include: {
        skills: true,
        applications: {
          include: { candidateInsight: { select: { matchScore: true } } },
        },
      },
    });

    if (candidates.length < 2) {
      throw new NotFoundException('At least 2 valid candidates required for comparison');
    }

    return this.comparisonEngine.compareCandidates(candidates);
  }

  async parseResume(fileName: string, buffer?: Buffer) {
    return this.resumeParser.parseResume(fileName, buffer);
  }

  async importResume(orgId: string, file: Express.Multer.File) {
    const parsed = await this.resumeParser.parseResume(file.originalname, file.buffer);

    const existing = await this.prisma.candidate.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: parsed.email } },
    });
    if (existing) throw new ConflictException('Candidate with this email already exists');

    const candidate = await this.prisma.candidate.create({
      data: {
        organizationId: orgId,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location,
        linkedinUrl: parsed.linkedinUrl,
        education: parsed.education,
        yearsExperience: parsed.yearsExperience,
        source: CandidateSource.OTHER,
        skills: {
          create: parsed.skills.map((s) => ({ name: s.name, level: s.level })),
        },
        experiences: {
          create: parsed.experiences.map((e) => ({
            company: e.company,
            title: e.title,
            startDate: new Date(e.startDate),
            endDate: e.endDate ? new Date(e.endDate) : null,
            isCurrent: e.isCurrent,
            description: e.description,
          })),
        },
        resumes: {
          create: {
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype,
            parsedText: parsed.summary,
          },
        },
      },
      include: {
        skills: true,
        experiences: true,
        applications: { include: { job: { select: { title: true, department: true } } } },
      },
    });

    const summary = this.summaryEngine.generateCandidateSummary({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      yearsExperience: candidate.yearsExperience,
      education: candidate.education,
      skills: candidate.skills,
      experiences: candidate.experiences,
      applications: candidate.applications,
    });

    const careerAnalysis = this.careerGapsEngine.detectCareerGaps(candidate.experiences);

    return { candidate, parsed, summary, careerAnalysis };
  }

  async getRecruitingInsights(orgId: string) {
    const applications = await this.prisma.application.findMany({
      where: { job: { organizationId: orgId }, status: 'ACTIVE' },
      include: {
        candidateInsight: { select: { matchScore: true, recommendation: true } },
        offer: { select: { status: true } },
      },
    });

    return this.recruitingInsightsEngine.generateRecruitingInsights({ applications });
  }

  private async getCandidate(orgId: string, candidateId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, organizationId: orgId },
      include: {
        skills: true,
        experiences: { orderBy: { startDate: 'desc' } },
        applications: {
          include: {
            job: { select: { id: true, title: true, department: true } },
            candidateInsight: true,
            interviews: { include: { interviewFeedback: true } },
          },
        },
      },
    });

    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }
}
