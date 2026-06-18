import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntelligenceEngine } from './intelligence.engine';
import { AnalyzeResumeDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private engine: IntelligenceEngine,
  ) {}

  async analyzeResume(orgId: string, dto: AnalyzeResumeDto) {
    const application = await this.prisma.application.findFirst({
      where: { id: dto.applicationId, job: { organizationId: orgId } },
      include: {
        job: true,
        candidate: {
          include: {
            skills: true,
            experiences: true,
            resumes: { orderBy: { uploadedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    const result = await this.engine.analyze({
      jobTitle: application.job.title,
      jobRequirements: application.job.requirements,
      jobDescription: application.job.description,
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      skills: application.candidate.skills,
      experiences: application.candidate.experiences,
      education: application.candidate.education,
      yearsExperience: application.candidate.yearsExperience,
      source: application.candidate.source,
    });

    const insight = await this.prisma.candidateInsight.upsert({
      where: { applicationId: dto.applicationId },
      create: {
        applicationId: dto.applicationId,
        matchScore: result.matchScore,
        skillOverlapScore: result.scoreBreakdown.skillOverlap,
        experienceScore: result.scoreBreakdown.experience,
        educationScore: result.scoreBreakdown.education,
        seniorityScore: result.scoreBreakdown.seniority,
        skillsSummary: result.skillsSummary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendation: result.recommendation,
        interviewQuestions: result.interviewQuestions,
        provider: result.provider,
      },
      update: {
        matchScore: result.matchScore,
        skillOverlapScore: result.scoreBreakdown.skillOverlap,
        experienceScore: result.scoreBreakdown.experience,
        educationScore: result.scoreBreakdown.education,
        seniorityScore: result.scoreBreakdown.seniority,
        skillsSummary: result.skillsSummary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendation: result.recommendation,
        interviewQuestions: result.interviewQuestions,
        provider: result.provider,
      },
    });

    await this.prisma.application.update({
      where: { id: dto.applicationId },
      data: { matchScore: result.matchScore },
    });

    return {
      ...insight,
      scoreBreakdown: result.scoreBreakdown,
    };
  }

  async getInsight(orgId: string, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, job: { organizationId: orgId } },
    });
    if (!application) throw new NotFoundException('Application not found');

    const insight = await this.prisma.candidateInsight.findUnique({
      where: { applicationId },
    });

    if (!insight) return null;

    return {
      ...insight,
      scoreBreakdown: {
        skillOverlap: insight.skillOverlapScore,
        experience: insight.experienceScore,
        education: insight.educationScore,
        seniority: insight.seniorityScore,
      },
    };
  }
}
