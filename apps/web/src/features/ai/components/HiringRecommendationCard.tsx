'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Skeleton } from '@/components/ui/badge';
import { ThumbsUp } from 'lucide-react';
import { HiringRecommendation, RECOMMENDATION_LABELS } from '@recruitflow/shared';
import { fetchHiringRecommendation } from '../services/recommendation.service';

const STATUS_VARIANT: Record<HiringRecommendation, 'success' | 'primary' | 'warning' | 'default' | 'danger'> = {
  [HiringRecommendation.STRONG_HIRE]: 'success',
  [HiringRecommendation.HIRE]: 'primary',
  [HiringRecommendation.CONSIDER]: 'warning',
  [HiringRecommendation.HOLD]: 'default',
  [HiringRecommendation.REJECT]: 'danger',
};

export function HiringRecommendationCard({
  candidateId,
  applicationId,
}: {
  candidateId: string;
  applicationId?: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-recommendation', candidateId, applicationId],
    queryFn: () => fetchHiringRecommendation(candidateId, applicationId),
    enabled: !!candidateId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ThumbsUp className="h-4 w-4 text-[#E8653A]" />
          Hiring Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : isError || !data ? (
          <p className="text-sm text-[#9C958A]">No recommendation available.</p>
        ) : (
          <div className="space-y-3">
            <Badge variant={STATUS_VARIANT[data.status]} className="text-sm px-3 py-1">
              {RECOMMENDATION_LABELS[data.status]}
            </Badge>
            <div>
              <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider mb-1.5">Reasons</p>
              <ul className="space-y-1">
                {data.reasons.map((r) => (
                  <li key={r} className="text-xs text-[#6B6560] flex gap-1.5">
                    <span className="text-[#2D8A6E]">•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs font-medium text-[#E8653A] bg-[#FDF0EB] rounded-lg px-3 py-2">{data.nextStep}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
