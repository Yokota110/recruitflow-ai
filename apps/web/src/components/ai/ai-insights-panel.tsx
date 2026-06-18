'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, Skeleton } from '@/components/ui/badge';
import { MatchScoreGauge } from './match-score-gauge';
import { Zap } from 'lucide-react';
import {
  HiringRecommendation,
  RECOMMENDATION_LABELS,
  PipelineStage,
  PIPELINE_STAGE_LABELS,
} from '@recruitflow/shared';

interface Insight {
  matchScore: number;
  skillOverlapScore?: number;
  experienceScore?: number;
  educationScore?: number;
  seniorityScore?: number;
  scoreBreakdown?: {
    skillOverlap: number;
    experience: number;
    education: number;
    seniority: number;
  };
  skillsSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: HiringRecommendation;
  interviewQuestions: string[];
}

interface Application {
  id: string;
  stage: PipelineStage;
  job: { id: string; title: string };
  candidateInsight?: Insight | null;
}

const RECOMMENDATION_VARIANT: Record<HiringRecommendation, 'success' | 'primary' | 'warning' | 'default' | 'danger'> = {
  STRONG_HIRE: 'success',
  HIRE: 'primary',
  CONSIDER: 'warning',
  HOLD: 'default',
  REJECT: 'danger',
};

export function AiInsightsPanel({
  applications,
  candidateId,
}: {
  applications: Application[];
  candidateId: string;
}) {
  const queryClient = useQueryClient();
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id ?? '');

  const selectedApp = applications.find((a) => a.id === selectedAppId) ?? applications[0];
  const insight = selectedApp?.candidateInsight;

  const analyzeMutation = useMutation({
    mutationFn: (applicationId: string) =>
      api('/ai/analyze-resume', { method: 'POST', body: JSON.stringify({ applicationId }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] }),
  });

  const breakdown = insight?.scoreBreakdown ?? (insight ? {
    skillOverlap: insight.skillOverlapScore ?? 0,
    experience: insight.experienceScore ?? 0,
    education: insight.educationScore ?? 0,
    seniority: insight.seniorityScore ?? 0,
  } : null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#E8653A]" />
            AI Intelligence
          </CardTitle>
          {applications.length > 1 && (
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="text-xs rounded-lg border border-[#E8E2D9] bg-[#F5F1EA] px-2 py-1"
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>{a.job.title}</option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {analyzeMutation.isPending ? (
          <div className="space-y-3 flex flex-col items-center py-4">
            <Skeleton className="h-[140px] w-[140px] rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : insight ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center">
              <MatchScoreGauge score={insight.matchScore} />
              <Badge variant={RECOMMENDATION_VARIANT[insight.recommendation]} className="mt-3">
                {RECOMMENDATION_LABELS[insight.recommendation]}
              </Badge>
            </div>

            {breakdown && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Score Breakdown</p>
                {[
                  { label: 'Skill Overlap', value: breakdown.skillOverlap },
                  { label: 'Experience', value: breakdown.experience },
                  { label: 'Education', value: breakdown.education },
                  { label: 'Seniority', value: breakdown.seniority },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6B6560]">{label}</span>
                      <span className="font-semibold tabular-nums">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#E8653A] transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#6B6560] leading-relaxed">{insight.skillsSummary}</p>

            <div>
              <p className="text-[10px] font-semibold text-[#2D8A6E] uppercase tracking-wider mb-1.5">Strengths</p>
              <ul className="space-y-1">
                {insight.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-[#6B6560] flex gap-1.5">
                    <span className="text-[#2D8A6E]">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-[#C4A35A] uppercase tracking-wider mb-1.5">Weaknesses</p>
              <ul className="space-y-1">
                {insight.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-[#6B6560] flex gap-1.5">
                    <span className="text-[#C4A35A]">−</span>{w}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-[#E8653A] uppercase tracking-wider mb-1.5">
                Interview Questions ({insight.interviewQuestions.length})
              </p>
              <ol className="space-y-1.5 list-decimal list-inside">
                {insight.interviewQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-[#6B6560] bg-[#FDF0EB] rounded-lg px-2.5 py-2 list-none">
                    <span className="font-semibold text-[#E8653A] mr-1">{i + 1}.</span>{q}
                  </li>
                ))}
              </ol>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={analyzeMutation.isPending}
              onClick={() => selectedApp && analyzeMutation.mutate(selectedApp.id)}
            >
              Re-analyze
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            {selectedApp && (
              <p className="text-xs text-[#9C958A] mb-1">
                {PIPELINE_STAGE_LABELS[selectedApp.stage]} · {selectedApp.job.title}
              </p>
            )}
            <p className="text-sm text-[#9C958A] mb-4">Generate AI-powered candidate intelligence</p>
            <Button
              disabled={!selectedApp || analyzeMutation.isPending}
              onClick={() => selectedApp && analyzeMutation.mutate(selectedApp.id)}
            >
              <Zap className="h-4 w-4" />
              Analyze Candidate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
