import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../crm/timeline/timeline.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import {
  CreateCandidateDto,
  UpdateCandidateDto,
  UpdateSkillsDto,
  UpdateExperienceDto,
  CreateNoteDto,
  CandidateQueryDto,
} from './dto/candidate.dto';
import { Prisma, TimelineEventType, WorkflowTriggerType } from '@prisma/client';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
    private workflowEngine: WorkflowEngineService,
  ) {}

  async findAll(orgId: string, query: CandidateQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CandidateWhereInput = {
      organizationId: orgId,
      ...(query.source && { source: query.source }),
      ...(query.tag && {
        tags: { some: { tag: { name: { equals: query.tag, mode: 'insensitive' } } } },
      }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          skills: true,
          tags: { include: { tag: true } },
          applications: {
            include: { job: { select: { id: true, title: true, status: true } } },
          },
          _count: { select: { resumes: true, notes: true } },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, organizationId: orgId },
      include: {
        skills: true,
        tags: { include: { tag: true } },
        experiences: { orderBy: { startDate: 'desc' } },
        resumes: { orderBy: { uploadedAt: 'desc' } },
        notes: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
        applications: {
          include: {
            job: { select: { id: true, title: true, department: true, status: true } },
            candidateInsight: true,
            aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
            interviews: { orderBy: { scheduledAt: 'desc' } },
            offer: true,
          },
        },
      },
    });

    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async create(orgId: string, dto: CreateCandidateDto) {
    const existing = await this.prisma.candidate.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });
    if (existing) throw new ConflictException('Candidate with this email already exists');

    const candidate = await this.prisma.candidate.create({
      data: { ...dto, organizationId: orgId },
      include: { skills: true },
    });

    void this.workflowEngine.dispatch({
      organizationId: orgId,
      triggerType: WorkflowTriggerType.CANDIDATE_CREATED,
      candidateId: candidate.id,
    });

    return candidate;
  }

  async update(orgId: string, id: string, dto: UpdateCandidateDto) {
    await this.ensureCandidate(orgId, id);
    return this.prisma.candidate.update({ where: { id }, data: dto });
  }

  async updateSkills(orgId: string, id: string, dto: UpdateSkillsDto) {
    await this.ensureCandidate(orgId, id);

    await this.prisma.candidateSkill.deleteMany({ where: { candidateId: id } });
    await this.prisma.candidateSkill.createMany({
      data: dto.skills.map((s) => ({ candidateId: id, name: s.name, level: s.level })),
    });

    return this.prisma.candidate.findUnique({
      where: { id },
      include: { skills: true },
    });
  }

  async updateExperience(orgId: string, id: string, dto: UpdateExperienceDto) {
    await this.ensureCandidate(orgId, id);

    await this.prisma.candidateExperience.deleteMany({ where: { candidateId: id } });
    await this.prisma.candidateExperience.createMany({
      data: dto.experiences.map((e) => ({
        candidateId: id,
        company: e.company,
        title: e.title,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        description: e.description,
        isCurrent: e.isCurrent ?? false,
      })),
    });

    return this.prisma.candidate.findUnique({
      where: { id },
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    });
  }

  async addNote(orgId: string, candidateId: string, authorId: string, dto: CreateNoteDto) {
    await this.ensureCandidate(orgId, candidateId);
    const note = await this.prisma.candidateNote.create({
      data: { candidateId, authorId, content: dto.content, isPinned: dto.isPinned ?? false },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await this.timeline.record(orgId, candidateId, TimelineEventType.NOTE_ADDED, 'Recruiter Note Added', {
      actorId: authorId,
      description: dto.content.slice(0, 200),
    });

    return note;
  }

  async addResume(orgId: string, candidateId: string, file: Express.Multer.File) {
    await this.ensureCandidate(orgId, candidateId);

    return this.prisma.resume.create({
      data: {
        candidateId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        parsedText: `Resume content for ${file.originalname}. Experienced professional with relevant skills.`,
      },
    });
  }

  private async ensureCandidate(orgId: string, id: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }
}
