'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { fetchCandidateSummary } from '../services/summary.service';

export function CandidateSummaryCard({ candidateId }: { candidateId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-summary', candidateId],
    queryFn: () => fetchCandidateSummary(candidateId),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-[#E8653A]" />
          AI Candidate Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-[#9C958A]">Unable to generate summary.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#1A1814] leading-relaxed font-medium">{data.professionalSummary}</p>

            <div>
              <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider mb-2">Strong Expertise</p>
              <ul className="space-y-1">
                {data.strongExpertise.map((s) => (
                  <li key={s} className="text-xs text-[#6B6560] flex gap-1.5">
                    <span className="text-[#E8653A]">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-[#6B6560] bg-[#F5F1EA] rounded-lg px-3 py-2">{data.fitAssessment}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-[#2D8A6E] uppercase tracking-wider mb-1.5">Potential Strengths</p>
                <ul className="space-y-1">
                  {data.potentialStrengths.map((s) => (
                    <li key={s} className="text-xs text-[#6B6560]">+ {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#C4A35A] uppercase tracking-wider mb-1.5">Potential Concerns</p>
                <ul className="space-y-1">
                  {data.potentialConcerns.map((c) => (
                    <li key={c} className="text-xs text-[#6B6560]">− {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
