import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApplicationStatus, InterviewStatus, OfferStatus, PipelineStage,
} from '@prisma/client';
import { SmartAlert } from '@recruitflow/shared';

@Injectable()
export class SmartAlertsService {
  constructor(private prisma: PrismaService) {}

  async generateSmartAlerts(orgId: string): Promise<SmartAlert[]> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 86400000);

    const [
      waitingCandidates,
      missingFeedback,
      expiringOffers,
      reviewCandidates,
    ] = await Promise.all([
      this.prisma.application.count({
        where: {
          job: { organizationId: orgId },
          status: ApplicationStatus.ACTIVE,
          stage: { notIn: [PipelineStage.HIRED, PipelineStage.REJECTED] },
          stageChangedAt: { lt: sevenDaysAgo },
        },
      }),
      this.prisma.interview.count({
        where: {
          job: { organizationId: orgId },
          status: InterviewStatus.COMPLETED,
          interviewFeedback: null,
        },
      }),
      this.prisma.offer.count({
        where: {
          application: { job: { organizationId: orgId } },
          status: OfferStatus.PENDING,
          expiresAt: { lte: threeDaysFromNow, gte: now },
        },
      }),
      this.prisma.application.count({
        where: {
          job: { organizationId: orgId },
          status: ApplicationStatus.ACTIVE,
          matchScore: { gte: 80 },
          stage: PipelineStage.SCREENING,
        },
      }),
    ]);

    const alerts: SmartAlert[] = [];

    if (waitingCandidates > 0) {
      alerts.push({
        id: 'waiting-candidates',
        type: 'waiting_candidates',
        message: `${waitingCandidates} candidate${waitingCandidates !== 1 ? 's' : ''} waiting >7 days in pipeline`,
        count: waitingCandidates,
        severity: waitingCandidates >= 5 ? 'warning' : 'info',
        href: '/pipeline',
      });
    }

    if (missingFeedback > 0) {
      alerts.push({
        id: 'missing-feedback',
        type: 'missing_feedback',
        message: `${missingFeedback} interview${missingFeedback !== 1 ? 's' : ''} missing feedback`,
        count: missingFeedback,
        severity: 'warning',
        href: '/interviews',
      });
    }

    if (expiringOffers > 0) {
      alerts.push({
        id: 'expiring-offers',
        type: 'expiring_offers',
        message: `${expiringOffers} offer${expiringOffers !== 1 ? 's' : ''} expiring soon`,
        count: expiringOffers,
        severity: 'danger',
        href: '/analytics',
      });
    }

    if (reviewCandidates > 0) {
      alerts.push({
        id: 'review-candidates',
        type: 'review_candidates',
        message: `${reviewCandidates} high-match candidate${reviewCandidates !== 1 ? 's' : ''} qualify for review`,
        count: reviewCandidates,
        severity: 'info',
        href: '/candidates',
      });
    }

    return alerts;
  }
}
