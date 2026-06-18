import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from './dto/job.dto';
import { ApplicationStatus, JobStatus, PipelineStage, Prisma } from '@prisma/client';
import { PIPELINE_STAGES } from '@recruitflow/shared';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: JobQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      organizationId: orgId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { department: { contains: query.search, mode: 'insensitive' } },
          { location: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hiringManager: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { applications: true } },
          applications: { select: { stage: true, status: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    const jobs = data.map((job) => ({
      ...job,
      applicationCount: job._count.applications,
      stageCounts: this.countStages(job.applications),
      metrics: this.computeMetrics(job.applications),
      _count: undefined,
      applications: undefined,
    }));

    return {
      data: jobs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId: orgId },
      include: {
        hiringManager: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        applications: {
          include: {
            candidate: {
              select: {
                id: true, firstName: true, lastName: true, email: true,
                avatarUrl: true, source: true,
              },
            },
            offer: { select: { status: true } },
          },
          orderBy: { appliedAt: 'desc' },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');

    const metrics = this.computeMetrics(job.applications);
    const pipelineTrend = await this.getPipelineTrend(orgId, id);

    return {
      ...job,
      applicationCount: job._count.applications,
      stageCounts: this.countStages(job.applications),
      metrics,
      pipelineTrend,
    };
  }

  async create(orgId: string, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: { ...dto, organizationId: orgId },
      include: {
        hiringManager: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateJobDto) {
    await this.ensureJob(orgId, id);
    return this.prisma.job.update({
      where: { id },
      data: dto,
      include: {
        hiringManager: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async publish(orgId: string, id: string) {
    await this.ensureJob(orgId, id);
    return this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.OPEN, openedAt: new Date() },
    });
  }

  async archive(orgId: string, id: string) {
    await this.ensureJob(orgId, id);
    return this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.ARCHIVED, closedAt: new Date() },
    });
  }

  async getPipeline(orgId: string, jobId: string) {
    await this.ensureJob(orgId, jobId);

    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true, firstName: true, lastName: true, email: true,
            avatarUrl: true, source: true, location: true,
          },
        },
      },
      orderBy: { stageChangedAt: 'desc' },
    });

    const stages = PIPELINE_STAGES.map((stage) => ({
      stage,
      count: applications.filter((a) => a.stage === stage).length,
      applications: applications
        .filter((a) => a.stage === stage)
        .map((a) => ({
          id: a.id,
          stage: a.stage,
          status: a.status,
          matchScore: a.matchScore,
          appliedAt: a.appliedAt,
          stageChangedAt: a.stageChangedAt,
          candidate: a.candidate,
        })),
    }));

    return { jobId, stages };
  }

  private computeMetrics(applications: { stage: PipelineStage; status: ApplicationStatus; offer?: { status: string } | null }[]) {
    const total = applications.length;
    const active = applications.filter((a) => a.status === ApplicationStatus.ACTIVE).length;
    const offersSent = applications.filter((a) => a.offer != null).length;
    const hired = applications.filter((a) => a.stage === PipelineStage.HIRED).length;
    const conversionRate = total > 0 ? Math.round((hired / total) * 100) : 0;

    return { totalApplicants: total, activeCandidates: active, offersSent, hiredCount: hired, conversionRate };
  }

  private async getPipelineTrend(orgId: string, jobId: string) {
    const weeks = 8;
    const trend = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const [applied, advanced, hired] = await Promise.all([
        this.prisma.application.count({
          where: { jobId, job: { organizationId: orgId }, appliedAt: { gte: weekStart, lt: weekEnd } },
        }),
        this.prisma.applicationStageHistory.count({
          where: {
            application: { jobId, job: { organizationId: orgId } },
            toStage: { in: [PipelineStage.INTERVIEW, PipelineStage.FINAL_INTERVIEW] },
            changedAt: { gte: weekStart, lt: weekEnd },
          },
        }),
        this.prisma.application.count({
          where: { jobId, job: { organizationId: orgId }, hiredAt: { gte: weekStart, lt: weekEnd } },
        }),
      ]);

      trend.push({ week: `W${weeks - i}`, applied, advanced, hired });
    }

    return trend;
  }

  private countStages(applications: { stage: PipelineStage }[]) {
    return PIPELINE_STAGES.reduce(
      (acc, stage) => {
        acc[stage] = applications.filter((a) => a.stage === stage).length;
        return acc;
      },
      {} as Record<PipelineStage, number>,
    );
  }

  private async ensureJob(orgId: string, id: string) {
    const job = await this.prisma.job.findFirst({ where: { id, organizationId: orgId } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
