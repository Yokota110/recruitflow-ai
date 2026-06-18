import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InterviewStatus, TaskStatus, TimelineEventType, PipelineStage, ApplicationStatus,
} from '@prisma/client';
import {
  PIPELINE_STAGES, PIPELINE_STAGE_LABELS, DEFAULT_STAGE_SLA_DAYS,
} from '@recruitflow/shared';

@Injectable()
export class CrmAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getProductivity(orgId: string, userId?: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      candidatesContacted,
      tasksCompleted,
      interviewsScheduled,
      offersSent,
      weeklyEvents,
      members,
    ] = await Promise.all([
      this.prisma.timelineEvent.count({
        where: {
          organizationId: orgId,
          type: { in: [TimelineEventType.EMAIL_SENT, TimelineEventType.OUTREACH] },
          createdAt: { gte: thirtyDaysAgo },
          ...(userId && { actorId: userId }),
        },
      }),
      this.prisma.recruiterTask.count({
        where: {
          organizationId: orgId,
          status: TaskStatus.DONE,
          completedAt: { gte: thirtyDaysAgo },
          ...(userId && { assigneeId: userId }),
        },
      }),
      this.prisma.interview.count({
        where: {
          job: { organizationId: orgId },
          status: InterviewStatus.SCHEDULED,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.offer.count({
        where: {
          application: { job: { organizationId: orgId } },
          sentAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.timelineEvent.findMany({
        where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
        select: { type: true, createdAt: true },
      }),
      this.prisma.organizationMember.findMany({
        where: { organizationId: orgId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);

    const weeklyActivity = this.buildWeeklyActivity(weeklyEvents);

    const recruiterPerformance = await Promise.all(
      members.map(async (m) => {
        const [contacted, tasks, interviews] = await Promise.all([
          this.prisma.timelineEvent.count({
            where: {
              organizationId: orgId,
              actorId: m.userId,
              type: { in: [TimelineEventType.EMAIL_SENT, TimelineEventType.OUTREACH] },
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          this.prisma.recruiterTask.count({
            where: {
              organizationId: orgId,
              assigneeId: m.userId,
              status: TaskStatus.DONE,
              completedAt: { gte: thirtyDaysAgo },
            },
          }),
          this.prisma.interview.count({
            where: {
              job: { organizationId: orgId },
              interviewerId: m.userId,
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
        ]);
        return {
          id: m.user.id,
          name: `${m.user.firstName} ${m.user.lastName}`,
          contacted,
          tasksCompleted: tasks,
          interviews,
        };
      }),
    );

    return {
      candidatesContacted,
      tasksCompleted,
      interviewsScheduled,
      offersSent,
      weeklyActivity,
      recruiterPerformance: recruiterPerformance.sort((a, b) => b.tasksCompleted - a.tasksCompleted),
    };
  }

  async getPipelineSla(orgId: string, jobId?: string) {
    const activeStages = PIPELINE_STAGES.filter(
      (s) => s !== PipelineStage.HIRED && s !== PipelineStage.REJECTED,
    );

    const history = await this.prisma.applicationStageHistory.findMany({
      where: {
        application: {
          job: { organizationId: orgId, ...(jobId && { id: jobId }) },
        },
        durationMs: { not: null },
      },
      select: { toStage: true, durationMs: true },
    });

    const stageDurations: Record<string, number[]> = {};
    for (const h of history) {
      if (!stageDurations[h.toStage]) stageDurations[h.toStage] = [];
      stageDurations[h.toStage].push(h.durationMs! / 86400000);
    }

    const activeApps = await this.prisma.application.findMany({
      where: {
        job: { organizationId: orgId, ...(jobId && { id: jobId }) },
        status: ApplicationStatus.ACTIVE,
        stage: { notIn: [PipelineStage.HIRED, PipelineStage.REJECTED] },
      },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        job: { select: { title: true } },
      },
    });

    const now = Date.now();
    const overdueCandidates: {
      applicationId: string;
      candidateName: string;
      jobTitle: string;
      stage: PipelineStage;
      daysInStage: number;
      thresholdDays: number;
    }[] = [];

    const stages = activeStages.map((stage) => {
      const durations = stageDurations[stage] ?? [];
      const averageDays = durations.length > 0
        ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
        : 0;
      const thresholdDays = DEFAULT_STAGE_SLA_DAYS[stage];

      const inStage = activeApps.filter((a) => a.stage === stage);
      for (const app of inStage) {
        const daysInStage = Math.floor((now - app.stageChangedAt.getTime()) / 86400000);
        if (daysInStage > thresholdDays) {
          overdueCandidates.push({
            applicationId: app.id,
            candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
            jobTitle: app.job.title,
            stage: app.stage,
            daysInStage,
            thresholdDays,
          });
        }
      }

      return {
        stage,
        label: PIPELINE_STAGE_LABELS[stage],
        averageDays,
        thresholdDays,
        overdueCount: inStage.filter((a) => {
          const days = Math.floor((now - a.stageChangedAt.getTime()) / 86400000);
          return days > thresholdDays;
        }).length,
      };
    });

    overdueCandidates.sort((a, b) => b.daysInStage - a.daysInStage);

    return { stages, overdueCandidates };
  }

  private buildWeeklyActivity(events: { type: TimelineEventType; createdAt: Date }[]) {
    const weeks: Record<string, { contacted: number; tasks: number; interviews: number }> = {};
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = d.toISOString().slice(0, 10);
      weeks[key] = { contacted: 0, tasks: 0, interviews: 0 };
    }

    for (const e of events) {
      const key = Object.keys(weeks).find((w) => {
        const weekStart = new Date(w);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return e.createdAt >= weekStart && e.createdAt < weekEnd;
      });
      if (!key) continue;

      if (e.type === TimelineEventType.EMAIL_SENT || e.type === TimelineEventType.OUTREACH) {
        weeks[key].contacted++;
      } else if (e.type === TimelineEventType.TASK_COMPLETED) {
        weeks[key].tasks++;
      } else if (e.type === TimelineEventType.INTERVIEW_SCHEDULED) {
        weeks[key].interviews++;
      }
    }

    return Object.entries(weeks).map(([week, data]) => ({ week, ...data }));
  }
}
