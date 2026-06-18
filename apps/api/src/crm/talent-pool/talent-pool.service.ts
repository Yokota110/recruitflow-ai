import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import {
  CreateTalentPoolCandidateDto, MoveToJobDto, TalentPoolQueryDto,
} from '../dto/crm.dto';
import {
  ApplicationStatus, PipelineStage, TalentPoolStatus, TimelineEventType,
} from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class TalentPoolService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async findAll(orgId: string, query: TalentPoolQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const searchFilter: Prisma.CandidateWhereInput | undefined = query.search
      ? {
          OR: [
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const tagFilter: Prisma.CandidateWhereInput | undefined = query.tag
      ? { tags: { some: { tag: { name: { equals: query.tag, mode: 'insensitive' } } } } }
      : undefined;

    let where: Prisma.CandidateWhereInput;

    if (query.status === TalentPoolStatus.ARCHIVED) {
      where = {
        organizationId: orgId,
        poolStatus: TalentPoolStatus.ARCHIVED,
        ...(searchFilter && searchFilter),
        ...(tagFilter && tagFilter),
      };
    } else {
      where = {
        organizationId: orgId,
        AND: [
          {
            OR: [
              { poolStatus: TalentPoolStatus.ACTIVE },
              {
                poolStatus: null,
                applications: { none: { status: ApplicationStatus.ACTIVE } },
              },
            ],
          },
          { NOT: { poolStatus: TalentPoolStatus.ARCHIVED } },
          ...(searchFilter ? [searchFilter] : []),
          ...(tagFilter ? [tagFilter] : []),
        ],
      };
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          skills: true,
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        source: c.source,
        location: c.location,
        yearsExperience: c.yearsExperience,
        lastContactedAt: c.lastContactedAt?.toISOString() ?? null,
        poolStatus: c.poolStatus,
        skills: c.skills.map((s) => ({ name: s.name })),
        tags: c.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
        status: c.poolStatus === TalentPoolStatus.ARCHIVED ? 'archived' as const : 'active' as const,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(orgId: string, userId: string, dto: CreateTalentPoolCandidateDto) {
    const existing = await this.prisma.candidate.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });
    if (existing) throw new ConflictException('Candidate with this email already exists');

    const candidate = await this.prisma.candidate.create({
      data: {
        organizationId: orgId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        location: dto.location,
        source: dto.source,
        yearsExperience: dto.yearsExperience,
        poolStatus: TalentPoolStatus.ACTIVE,
        skills: dto.skills?.length
          ? { create: dto.skills.map((name) => ({ name })) }
          : undefined,
      },
      include: { skills: true, tags: { include: { tag: true } } },
    });

    if (dto.tags?.length) {
      for (const tagName of dto.tags) {
        const tag = await this.ensureTag(orgId, tagName);
        await this.prisma.candidateTag.create({
          data: { candidateId: candidate.id, tagId: tag.id },
        });
      }
    }

    await this.timeline.record(orgId, candidate.id, TimelineEventType.CANDIDATE_ADDED, 'Added to Talent Pool', {
      actorId: userId,
    });

    return this.findOne(orgId, candidate.id);
  }

  async findOne(orgId: string, id: string) {
    const c = await this.prisma.candidate.findFirst({
      where: { id, organizationId: orgId },
      include: {
        skills: true,
        tags: { include: { tag: true } },
      },
    });
    if (!c) throw new NotFoundException('Candidate not found');
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      source: c.source,
      location: c.location,
      yearsExperience: c.yearsExperience,
      lastContactedAt: c.lastContactedAt?.toISOString() ?? null,
      poolStatus: c.poolStatus,
      skills: c.skills.map((s) => ({ name: s.name })),
      tags: c.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
      status: c.poolStatus === TalentPoolStatus.ARCHIVED ? 'archived' as const : 'active' as const,
    };
  }

  async archive(orgId: string, id: string) {
    await this.ensureCandidate(orgId, id);
    await this.prisma.candidate.update({
      where: { id },
      data: { poolStatus: TalentPoolStatus.ARCHIVED },
    });
    return { success: true };
  }

  async moveToJob(orgId: string, userId: string, candidateId: string, dto: MoveToJobDto) {
    const candidate = await this.ensureCandidate(orgId, candidateId);
    const job = await this.prisma.job.findFirst({
      where: { id: dto.jobId, organizationId: orgId },
    });
    if (!job) throw new NotFoundException('Job not found');

    const existing = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: dto.jobId, candidateId } },
    });
    if (existing) throw new ConflictException('Candidate already applied to this job');

    const application = await this.prisma.$transaction(async (tx) => {
      await tx.candidate.update({
        where: { id: candidateId },
        data: { poolStatus: null },
      });

      const app = await tx.application.create({
        data: { jobId: dto.jobId, candidateId, stage: PipelineStage.APPLIED },
      });

      await tx.applicationStageHistory.create({
        data: { applicationId: app.id, toStage: PipelineStage.APPLIED, changedById: userId },
      });

      return app;
    });

    await this.timeline.record(orgId, candidateId, TimelineEventType.STAGE_CHANGED, `Moved to job: ${job.title}`, {
      actorId: userId,
      metadata: { jobId: dto.jobId, applicationId: application.id },
    });

    return {
      applicationId: application.id,
      jobTitle: job.title,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
    };
  }

  private async ensureCandidate(orgId: string, id: string) {
    const c = await this.prisma.candidate.findFirst({ where: { id, organizationId: orgId } });
    if (!c) throw new NotFoundException('Candidate not found');
    return c;
  }

  private async ensureTag(orgId: string, name: string) {
    const existing = await this.prisma.tag.findUnique({
      where: { organizationId_name: { organizationId: orgId, name } },
    });
    if (existing) return existing;
    return this.prisma.tag.create({ data: { organizationId: orgId, name } });
  }
}
