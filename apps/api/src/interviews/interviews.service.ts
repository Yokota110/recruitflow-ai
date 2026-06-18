import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  StructuredFeedbackDto,
  InterviewQueryDto,
} from './dto/interview.dto';
import { InterviewStatus, NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(orgId: string, query: InterviewQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.InterviewWhereInput = {
      job: { organizationId: orgId },
      ...(query.jobId && { jobId: query.jobId }),
      ...(query.from && { scheduledAt: { gte: new Date(query.from) } }),
      ...(query.to && { scheduledAt: { lte: new Date(query.to) } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          application: {
            include: {
              candidate: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
          job: { select: { id: true, title: true } },
          interviewer: { select: { id: true, firstName: true, lastName: true } },
          interviewFeedback: true,
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(orgId: string, interviewerId: string, dto: CreateInterviewDto) {
    const application = await this.prisma.application.findFirst({
      where: { id: dto.applicationId, job: { organizationId: orgId } },
      include: { candidate: true, job: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const interview = await this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        jobId: application.jobId,
        interviewerId,
        title: dto.title,
        stage: dto.stage,
        scheduledAt: new Date(dto.scheduledAt),
        durationMin: dto.durationMin ?? 60,
        meetingUrl: dto.meetingUrl,
        location: dto.location,
        notes: dto.notes,
      },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        job: { select: { id: true, title: true } },
        interviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.notifications.notifyOrgRecruiters(
      orgId,
      NotificationType.INTERVIEW_SCHEDULED,
      'Interview Scheduled',
      `${application.candidate.firstName} ${application.candidate.lastName} — ${dto.title} for ${application.job.title}`,
      { interviewId: interview.id, applicationId: dto.applicationId },
    );

    return interview;
  }

  async update(orgId: string, id: string, dto: UpdateInterviewDto) {
    await this.ensureInterview(orgId, id);
    return this.prisma.interview.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
      },
    });
  }

  async submitStructuredFeedback(orgId: string, id: string, dto: StructuredFeedbackDto) {
    await this.ensureInterview(orgId, id);

    const avgRating = Math.round(
      (dto.communication + dto.technicalSkills + dto.cultureFit + dto.recommendation) / 4,
    );

    await this.prisma.interviewFeedback.upsert({
      where: { interviewId: id },
      create: {
        interviewId: id,
        communication: dto.communication,
        technicalSkills: dto.technicalSkills,
        cultureFit: dto.cultureFit,
        recommendation: dto.recommendation,
        notes: dto.notes,
      },
      update: {
        communication: dto.communication,
        technicalSkills: dto.technicalSkills,
        cultureFit: dto.cultureFit,
        recommendation: dto.recommendation,
        notes: dto.notes,
      },
    });

    return this.prisma.interview.update({
      where: { id },
      data: {
        status: InterviewStatus.COMPLETED,
        rating: avgRating,
        feedback: dto.notes,
      },
      include: { interviewFeedback: true },
    });
  }

  private async ensureInterview(orgId: string, id: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id, job: { organizationId: orgId } },
    });
    if (!interview) throw new NotFoundException('Interview not found');
    return interview;
  }
}
