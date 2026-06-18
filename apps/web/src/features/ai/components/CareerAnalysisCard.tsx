'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Skeleton } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { detectCareerGaps } from '../services/comparison.service';

export function CareerAnalysisCard({ candidateId }: { candidateId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['career-gaps', candidateId],
    queryFn: () => detectCareerGaps(candidateId),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Career Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 rounded-lg" />
        ) : isError || !data ? (
          <p className="text-sm text-[#9C958A]">Unable to analyze career timeline.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {data.hasGaps ? (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Employment Gap
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> No Gaps
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#6B6560]">{data.message}</p>
            {data.gaps.map((gap) => (
              <div key={gap.label} className="text-xs bg-[#FBF5E8] border border-[#EDE0C0] rounded-lg px-3 py-2">
                <p className="font-semibold text-[#9A7B2E]">{gap.label}</p>
                <p className="text-[#6B6560] mt-0.5">{gap.months} month gap detected</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
