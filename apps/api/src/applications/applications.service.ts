import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { CreateApplicationDto, MoveStageDto, RejectApplicationDto } from './dto/application.dto';
import { ApplicationStatus, NotificationType, PipelineStage, WorkflowTriggerType } from '@prisma/client';
import { PIPELINE_STAGE_LABELS } from '@recruitflow/shared';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private workflowEngine: WorkflowEngineService,
  ) {}

  async create(orgId: string, userId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.job.findFirst({
      where: { id: dto.jobId, organizationId: orgId },
    });
    if (!job) throw new NotFoundException('Job not found');

    const candidate = await this.prisma.candidate.findFirst({
      where: { id: dto.candidateId, organizationId: orgId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const existing = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: dto.jobId, candidateId: dto.candidateId } },
    });
    if (existing) throw new ConflictException('Candidate already applied to this job');

    const application = await this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        stage: PipelineStage.APPLIED,
      },
      include: {
        candidate: true,
        job: { select: { id: true, title: true } },
      },
    });

    await this.prisma.applicationStageHistory.create({
      data: { applicationId: application.id, toStage: PipelineStage.APPLIED, changedById: userId },
    });

    await this.notifications.notifyOrgRecruiters(
      orgId,
      NotificationType.NEW_APPLICATION,
      'New Application',
      `${candidate.firstName} ${candidate.lastName} applied for ${job.title}`,
      { applicationId: application.id, jobId: dto.jobId, candidateId: dto.candidateId },
    );

    void this.workflowEngine.dispatch({
      organizationId: orgId,
      triggerType: WorkflowTriggerType.CANDIDATE_APPLIED,
      candidateId: dto.candidateId,
      applicationId: application.id,
      jobId: dto.jobId,
      userId,
    });

    return application;
  }

  async moveStage(orgId: string, id: string, userId: string, dto: MoveStageDto) {
    const application = await this.ensureApplication(orgId, id);
    const now = new Date();
    const durationMs = now.getTime() - application.stageChangedAt.getTime();

    const isRejected = dto.stage === PipelineStage.REJECTED;
    const isHired = dto.stage === PipelineStage.HIRED;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.applicationStageHistory.create({
        data: {
          applicationId: id,
          fromStage: application.stage,
          toStage: dto.stage,
          changedById: userId,
          durationMs,
        },
      });

      return tx.application.update({
        where: { id },
        data: {
          stage: dto.stage,
          stageChangedAt: now,
          status: isRejected ? ApplicationStatus.REJECTED : isHired ? ApplicationStatus.HIRED : ApplicationStatus.ACTIVE,
          rejectedAt: isRejected ? now : application.rejectedAt,
          hiredAt: isHired ? now : application.hiredAt,
        },
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, source: true },
          },
        },
      });
    });

    const candidate = await this.prisma.candidate.findUnique({ where: { id: application.candidateId } });
    const job = await this.prisma.job.findUnique({ where: { id: application.jobId } });

    await this.notifications.notifyOrgRecruiters(
      orgId,
      NotificationType.STAGE_CHANGED,
      'Pipeline Update',
      `${candidate?.firstName} ${candidate?.lastName} moved to ${PIPELINE_STAGE_LABELS[dto.stage]} for ${job?.title}`,
      { applicationId: id, fromStage: application.stage, toStage: dto.stage },
    );

    void this.workflowEngine.dispatch({
      organizationId: orgId,
      triggerType: WorkflowTriggerType.CANDIDATE_MOVED_STAGE,
      candidateId: application.candidateId,
      applicationId: id,
      jobId: application.jobId,
      userId,
      metadata: { fromStage: application.stage, toStage: dto.stage },
    });

    return updated;
  }

  async reject(orgId: string, id: string, userId: string, dto: RejectApplicationDto) {
    const application = await this.ensureApplication(orgId, id);
    const now = new Date();

    await this.prisma.applicationStageHistory.create({
      data: {
        applicationId: id,
        fromStage: application.stage,
        toStage: PipelineStage.REJECTED,
        changedById: userId,
        durationMs: now.getTime() - application.stageChangedAt.getTime(),
      },
    });

    return this.prisma.application.update({
      where: { id },
      data: {
        stage: PipelineStage.REJECTED,
        status: ApplicationStatus.REJECTED,
        rejectedAt: now,
        rejectionReason: dto.reason,
        stageChangedAt: now,
      },
    });
  }

  async getHistory(orgId: string, id: string) {
    await this.ensureApplication(orgId, id);
    return this.prisma.applicationStageHistory.findMany({
      where: { applicationId: id },
      orderBy: { changedAt: 'desc' },
      include: {
        changedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  private async ensureApplication(orgId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, job: { organizationId: orgId } },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }
}
