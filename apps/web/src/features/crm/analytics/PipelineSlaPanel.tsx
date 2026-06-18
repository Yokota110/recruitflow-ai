'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { fetchPipelineSla } from '../services/crm.service';
import { AlertTriangle } from 'lucide-react';

export function PipelineSlaPanel({ jobId }: { jobId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['pipeline-sla', jobId],
    queryFn: () => fetchPipelineSla(jobId),
    enabled: true,
  });

  if (isLoading) return <Skeleton className="h-24 rounded-xl mb-4" />;
  if (!data) return null;

  return (
    <div className="mb-4 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {data.stages.filter((s) => s.thresholdDays > 0).map((stage) => (
          <Card key={stage.stage} className="p-3">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase">{stage.label}</p>
            <p className="text-lg font-bold text-[#1A1814] tabular-nums">{stage.averageDays}d</p>
            <p className="text-[10px] text-[#9C958A]">avg · SLA {stage.thresholdDays}d</p>
            {stage.overdueCount > 0 && (
              <p className="text-[10px] font-semibold text-[#C45C5C] mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {stage.overdueCount} overdue
              </p>
            )}
          </Card>
        ))}
      </div>

      {data.overdueCandidates.length > 0 && (
        <Card className="border-[#C45C5C]/30 bg-[#FDF5F5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-[#C45C5C]">
              <AlertTriangle className="h-4 w-4" /> Overdue Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.overdueCandidates.slice(0, 5).map((o) => (
                <div key={o.applicationId} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1A1814]">{o.candidateName}</span>
                  <span className="text-[#C45C5C] font-semibold">
                    {o.daysInStage}d in {o.stage.replace('_', ' ')} (SLA {o.thresholdDays}d)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function SlaOverdueBadge({ daysInStage, stage }: { daysInStage: number; stage: string }) {
  const thresholds: Record<string, number> = {
    APPLIED: 3, SCREENING: 5, INTERVIEW: 7, FINAL_INTERVIEW: 5, OFFER: 3,
  };
  const threshold = thresholds[stage] ?? 7;
  if (daysInStage <= threshold) return null;
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FDF5F5] text-[#C45C5C] border border-[#C45C5C]/30 flex items-center gap-0.5">
      <AlertTriangle className="h-2.5 w-2.5" /> {daysInStage}d
    </span>
  );
}
