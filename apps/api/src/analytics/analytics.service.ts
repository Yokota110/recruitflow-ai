import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrmAnalyticsService } from '../crm/analytics/crm-analytics.service';
import { TasksService } from '../crm/tasks/tasks.service';
import { SmartAlertsService } from '../workflows/smart-alerts.service';
import {
  JobStatus, ApplicationStatus, InterviewStatus, PipelineStage,
  OfferStatus, CandidateSource,
} from '@prisma/client';
import {
  PIPELINE_STAGES, PIPELINE_STAGE_LABELS, SOURCE_LABELS,
} from '@recruitflow/shared';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private crmAnalytics: CrmAnalyticsService,
    private tasks: TasksService,
    private smartAlerts: SmartAlertsService,
  ) {}

  async getDashboard(orgId: string, userId?: string) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      openJobs,
      activeCandidates,
      interviewsThisWeek,
      offers,
      funnelData,
      hiredApps,
      recentApplications,
      upcomingInterviews,
      topRecruiters,
      topSources,
      hiringVelocityTrend,
      crmProductivity,
      myTasks,
      smartAlerts,
    ] = await Promise.all([
      this.prisma.job.count({ where: { organizationId: orgId, status: JobStatus.OPEN } }),
      this.prisma.application.count({
        where: { job: { organizationId: orgId }, status: ApplicationStatus.ACTIVE },
      }),
      this.prisma.interview.count({
        where: {
          job: { organizationId: orgId },
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      this.prisma.offer.findMany({
        where: { application: { job: { organizationId: orgId } } },
      }),
      this.prisma.application.groupBy({
        by: ['stage'],
        where: { job: { organizationId: orgId } },
        _count: true,
      }),
      this.prisma.application.findMany({
        where: {
          job: { organizationId: orgId },
          hiredAt: { not: null },
          appliedAt: { gte: thirtyDaysAgo },
        },
        select: { appliedAt: true, hiredAt: true },
      }),
      this.prisma.application.findMany({
        where: { job: { organizationId: orgId } },
        orderBy: { appliedAt: 'desc' },
        take: 8,
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } },
        },
      }),
      this.prisma.interview.findMany({
        where: {
          job: { organizationId: orgId },
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: now },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 6,
        include: {
          application: {
            include: { candidate: { select: { firstName: true, lastName: true } } },
          },
          job: { select: { title: true } },
        },
      }),
      this.getRecruiterPerformance(orgId),
      this.getSourcePerformance(orgId),
      this.getHiringVelocityTrend(orgId),
      this.crmAnalytics.getProductivity(orgId, userId),
      userId ? this.tasks.findMyTasks(orgId, userId, 5) : Promise.resolve([]),
      this.smartAlerts.generateSmartAlerts(orgId),
    ]);

    const acceptedOffers = offers.filter((o) => o.status === OfferStatus.ACCEPTED).length;
    const decidedOffers = offers.filter(
      (o) => o.status === OfferStatus.ACCEPTED || o.status === OfferStatus.DECLINED,
    ).length;
    const offerAcceptanceRate = decidedOffers > 0 ? acceptedOffers / decidedOffers : 0;

    const timeToHireDays = hiredApps.length > 0
      ? hiredApps.reduce((sum, app) =>
          sum + (app.hiredAt!.getTime() - app.appliedAt.getTime()) / 86400000, 0) / hiredApps.length
      : 0;

    const lastWeekHires = hiringVelocityTrend[hiringVelocityTrend.length - 1]?.hires ?? 0;

    const hiringFunnel = PIPELINE_STAGES.filter((s) => s !== PipelineStage.REJECTED).map((stage) => ({
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: funnelData.find((f) => f.stage === stage)?._count ?? 0,
    }));

    return {
      kpis: {
        openJobs,
        activeCandidates,
        interviewsThisWeek,
        timeToHire: Math.round(timeToHireDays),
        offerAcceptanceRate: Math.round(offerAcceptanceRate * 100) / 100,
        hiringVelocity: lastWeekHires,
      },
      hiringFunnel,
      recentApplications: recentApplications.map((a) => ({
        id: a.id,
        candidateName: `${a.candidate.firstName} ${a.candidate.lastName}`,
        jobTitle: a.job.title,
        stage: a.stage,
        matchScore: a.matchScore,
        appliedAt: a.appliedAt,
      })),
      upcomingInterviews: upcomingInterviews.map((i) => ({
        id: i.id,
        candidateName: `${i.application.candidate.firstName} ${i.application.candidate.lastName}`,
        jobTitle: i.job.title,
        title: i.title,
        scheduledAt: i.scheduledAt,
        meetingUrl: i.meetingUrl,
      })),
      topRecruiters,
      topSources,
      hiringVelocityTrend,
      timeToHire: {
        averageDays: Math.round(timeToHireDays),
        trend: hiringVelocityTrend.map((w) => ({ week: w.week, averageDays: 0, hires: w.hires })),
      },
      recentActivity: [],
      crmProductivity,
      myTasks,
      smartAlerts,
    };
  }

  async getFunnel(orgId: string, jobId?: string) {
    const where = { job: { organizationId: orgId, ...(jobId && { id: jobId }) } };
    const data = await this.prisma.application.groupBy({
      by: ['stage'],
      where,
      _count: true,
    });
    return PIPELINE_STAGES.filter((s) => s !== PipelineStage.REJECTED).map((stage) => ({
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: data.find((d) => d.stage === stage)?._count ?? 0,
    }));
  }

  async getSourcePerformance(orgId: string) {
    const candidates = await this.prisma.candidate.findMany({
      where: { organizationId: orgId },
      include: {
        applications: {
          include: { interviews: true },
        },
      },
    });

    return Object.values(CandidateSource).map((source) => {
      const sourceCandidates = candidates.filter((c) => c.source === source);
      const apps = sourceCandidates.flatMap((c) => c.applications);
      const interviews = apps.reduce((s, a) => s + a.interviews.length, 0);
      const hired = apps.filter((a) => a.stage === PipelineStage.HIRED).length;

      return {
        source,
        label: SOURCE_LABELS[source],
        applicants: sourceCandidates.length,
        interviews,
        hires: hired,
        conversionRate: sourceCandidates.length > 0 ? Math.round((hired / sourceCandidates.length) * 100) : 0,
        total: sourceCandidates.length,
        hired,
      };
    }).filter((s) => s.applicants > 0);
  }

  async getRecruiterPerformance(orgId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true,
          },
        },
      },
    });

    const results = await Promise.all(
      members.map(async (m) => {
        const [candidatesHandled, interviewsCompleted, hiresClosed] = await Promise.all([
          this.prisma.applicationStageHistory.count({
            where: { changedById: m.userId, application: { job: { organizationId: orgId } } },
          }),
          this.prisma.interview.count({
            where: {
              interviewerId: m.userId,
              status: InterviewStatus.COMPLETED,
              job: { organizationId: orgId },
            },
          }),
          this.prisma.applicationStageHistory.count({
            where: {
              changedById: m.userId,
              toStage: PipelineStage.HIRED,
              application: { job: { organizationId: orgId } },
            },
          }),
        ]);

        return {
          id: m.user.id,
          name: `${m.user.firstName} ${m.user.lastName}`,
          candidatesHandled,
          interviewsCompleted,
          hiresClosed,
        };
      }),
    );

    return results.sort((a, b) => b.hiresClosed - a.hiresClosed).slice(0, 5);
  }

  async getConversionRates(orgId: string) {
    const history = await this.prisma.applicationStageHistory.findMany({
      where: { application: { job: { organizationId: orgId } } },
      select: { fromStage: true, toStage: true },
    });

    const transitions: Record<string, number> = {};
    const stageCounts: Record<string, number> = {};

    for (const h of history) {
      if (h.fromStage) {
        const key = `${h.fromStage}->${h.toStage}`;
        transitions[key] = (transitions[key] || 0) + 1;
        stageCounts[h.fromStage] = (stageCounts[h.fromStage] || 0) + 1;
      }
    }

    const pairs = [
      { from: PipelineStage.APPLIED, to: PipelineStage.SCREENING },
      { from: PipelineStage.SCREENING, to: PipelineStage.INTERVIEW },
      { from: PipelineStage.INTERVIEW, to: PipelineStage.FINAL_INTERVIEW },
      { from: PipelineStage.FINAL_INTERVIEW, to: PipelineStage.OFFER },
      { from: PipelineStage.OFFER, to: PipelineStage.HIRED },
    ];

    return pairs.map(({ from, to }) => {
      const key = `${from}->${to}`;
      const count = transitions[key] || 0;
      const total = stageCounts[from] || 0;
      return {
        from, to,
        fromLabel: PIPELINE_STAGE_LABELS[from],
        toLabel: PIPELINE_STAGE_LABELS[to],
        count,
        rate: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  }

  async getOfferMetrics(orgId: string) {
    const offers = await this.prisma.offer.findMany({
      where: { application: { job: { organizationId: orgId } } },
      include: {
        application: {
          include: {
            candidate: { select: { firstName: true, lastName: true } },
            job: { select: { title: true } },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    const accepted = offers.filter((o) => o.status === OfferStatus.ACCEPTED).length;
    const declined = offers.filter((o) => o.status === OfferStatus.DECLINED).length;
    const pending = offers.filter((o) => o.status === OfferStatus.PENDING).length;

    return {
      summary: {
        total: offers.length,
        accepted,
        declined,
        pending,
        acceptanceRate: accepted + declined > 0 ? Math.round((accepted / (accepted + declined)) * 100) : 0,
      },
      offers: offers.map((o) => ({
        id: o.id,
        candidateName: `${o.application.candidate.firstName} ${o.application.candidate.lastName}`,
        jobTitle: o.application.job.title,
        salary: o.salary,
        currency: o.currency,
        status: o.status,
        sentAt: o.sentAt,
        acceptedAt: o.acceptedAt,
      })),
    };
  }

  async getVelocity(orgId: string) {
    return this.getHiringVelocityTrend(orgId);
  }

  private async getHiringVelocityTrend(orgId: string) {
    const weeks = 8;
    const trend = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const hires = await this.prisma.application.count({
        where: {
          job: { organizationId: orgId },
          hiredAt: { gte: weekStart, lt: weekEnd },
        },
      });

      trend.push({ week: `W${weeks - i}`, hires, averageDays: 0 });
    }

    return trend;
  }
}
