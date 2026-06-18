import { Injectable } from '@nestjs/common';
import { RecruitingInsightsResult, RecruitingInsight } from '@recruitflow/shared';
import { PipelineStage } from '@prisma/client';

interface OrgPipelineData {
  applications: {
    stage: PipelineStage;
    matchScore: number | null;
    candidateInsight: { matchScore: number; recommendation: string } | null;
    offer: { status: string } | null;
  }[];
}

@Injectable()
export class RecruitingInsightsEngine {
  generateRecruitingInsights(data: OrgPipelineData): RecruitingInsightsResult {
    const apps = data.applications;
    const insights: RecruitingInsight[] = [];

    const readyForFinal = apps.filter(
      (a) => a.stage === PipelineStage.INTERVIEW &&
        (a.candidateInsight?.matchScore ?? a.matchScore ?? 0) >= 70,
    ).length;

    if (readyForFinal > 0) {
      insights.push({
        id: 'ready-final',
        type: 'ready_for_final',
        message: `${readyForFinal} candidate${readyForFinal > 1 ? 's are' : ' is'} ready for Final Interview.`,
        count: readyForFinal,
        severity: 'success',
      });
    }

    const likelyOffer = apps.filter(
      (a) => a.stage === PipelineStage.FINAL_INTERVIEW || a.stage === PipelineStage.OFFER,
    ).length;

    if (likelyOffer > 0) {
      insights.push({
        id: 'likely-offer',
        type: 'likely_offer',
        message: `${likelyOffer} candidate${likelyOffer > 1 ? 's are' : ' is'} likely to receive offers.`,
        count: likelyOffer,
        severity: 'info',
      });
    }

    const rejectionRisk = apps.filter(
      (a) => a.stage === PipelineStage.SCREENING &&
        (a.candidateInsight?.matchScore ?? a.matchScore ?? 100) < 45,
    ).length;

    if (rejectionRisk > 0) {
      insights.push({
        id: 'rejection-risk',
        type: 'rejection_risk',
        message: `${rejectionRisk} candidate${rejectionRisk > 1 ? 's show' : ' shows'} high rejection risk.`,
        count: rejectionRisk,
        severity: 'warning',
      });
    }

    const staleScreening = apps.filter((a) => a.stage === PipelineStage.APPLIED).length;
    if (staleScreening > 5) {
      insights.push({
        id: 'action-screening',
        type: 'action_needed',
        message: `${staleScreening} applications awaiting initial screening review.`,
        count: staleScreening,
        severity: 'danger',
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'all-clear',
        type: 'action_needed',
        message: 'Pipeline is healthy — no urgent actions required.',
        count: 0,
        severity: 'info',
      });
    }

    return { insights, provider: 'copilot-insights-engine' };
  }
}
