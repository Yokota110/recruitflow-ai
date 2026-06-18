import { Injectable } from '@nestjs/common';
import { CopilotHiringRecommendation, HiringRecommendation } from '@recruitflow/shared';
import { PipelineStage } from '@prisma/client';

interface RecommendationInput {
  yearsExperience: number | null;
  skills: { name: string }[];
  experiences: { company: string; title: string }[];
  application: {
    stage: PipelineStage;
    matchScore: number | null;
    candidateInsight: {
      matchScore: number;
      skillOverlapScore: number;
      recommendation: string;
      strengths: string[];
    } | null;
    interviews: { interviewFeedback: { recommendation: number } | null }[];
  } | null;
}

@Injectable()
export class RecommendationEngine {
  generateHiringRecommendation(input: RecommendationInput): CopilotHiringRecommendation {
    const insight = input.application?.candidateInsight;
    const matchScore = insight?.matchScore ?? input.application?.matchScore ?? null;
    const years = input.yearsExperience ?? 3;
    const skillOverlap = insight?.skillOverlapScore ?? matchScore ?? 50;

    const feedbackScores = (input.application?.interviews ?? [])
      .map((i) => i.interviewFeedback?.recommendation)
      .filter((s): s is number => s != null);
    const avgFeedback = feedbackScores.length > 0
      ? feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length
      : null;

    const saasBackground = input.experiences.some(
      (e) => e.company.toLowerCase().includes('tech') || e.title.toLowerCase().includes('senior'),
    );

    const reasons: string[] = [];
    if (skillOverlap) reasons.push(`${skillOverlap}% skill overlap`);
    reasons.push(`${years} years experience`);
    if (saasBackground) reasons.push('Previous SaaS background');
    if (avgFeedback != null) reasons.push(`Strong interview feedback (${avgFeedback.toFixed(1)}/5 avg)`);
    if (insight?.strengths[0]) reasons.push(insight.strengths[0]);

    let status: HiringRecommendation;
    const score = matchScore ?? 50;

    if (score >= 88 && avgFeedback != null && avgFeedback >= 4) {
      status = HiringRecommendation.STRONG_HIRE;
    } else if (score >= 75) {
      status = HiringRecommendation.HIRE;
    } else if (score >= 60) {
      status = HiringRecommendation.CONSIDER;
    } else if (score >= 45) {
      status = HiringRecommendation.HOLD;
    } else {
      status = HiringRecommendation.REJECT;
    }

    const stage = input.application?.stage;
    let nextStep: string;
    if (status === HiringRecommendation.STRONG_HIRE || status === HiringRecommendation.HIRE) {
      nextStep = stage === PipelineStage.FINAL_INTERVIEW || stage === PipelineStage.OFFER
        ? 'Recommended to extend an offer.'
        : 'Recommended for Final Interview.';
    } else if (status === HiringRecommendation.CONSIDER) {
      nextStep = 'Schedule additional screening before advancing.';
    } else if (status === HiringRecommendation.HOLD) {
      nextStep = 'Place on hold — revisit after pipeline changes.';
    } else {
      nextStep = 'Not recommended to advance at this time.';
    }

    return {
      status,
      reasons: reasons.slice(0, 5),
      nextStep,
      matchScore,
      provider: 'copilot-recommendation-engine',
    };
  }
}
