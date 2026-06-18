'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/sidebar';
import { Card } from '@/components/ui/card';
import { Badge, Skeleton } from '@/components/ui/badge';
import { fetchWorkflowLogs } from '../services/workflows.service';
import { WorkflowExecutionStatus } from '@recruitflow/shared';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

const STATUS_VARIANT: Record<WorkflowExecutionStatus, 'success' | 'danger' | 'outline'> = {
  [WorkflowExecutionStatus.SUCCESS]: 'success',
  [WorkflowExecutionStatus.FAILED]: 'danger',
  [WorkflowExecutionStatus.PENDING]: 'outline',
};

export function WorkflowLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['workflow-logs'],
    queryFn: fetchWorkflowLogs,
  });

  return (
    <div>
      <PageHeader
        title="Execution Logs"
        description="Workflow run history with status and duration"
        action={
          <Link href="/workflows" className="text-sm text-[#E8653A] hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Workflows
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_160px_90px_80px_1fr] gap-2 px-5 py-3 bg-[#F5F1EA] text-[10px] font-semibold text-[#9C958A] uppercase border-b border-[#E8E2D9]">
            <span>Workflow</span>
            <span>Candidate</span>
            <span>Execution Time</span>
            <span>Status</span>
            <span>Duration</span>
            <span>Result</span>
          </div>
          {data?.map((log) => (
            <div key={log.id} className="grid grid-cols-[1fr_1fr_160px_90px_80px_1fr] gap-2 items-center px-5 py-3 border-b border-[#F0EBE3] text-xs">
              <span className="font-medium text-[#1A1814] truncate">{log.workflowName}</span>
              <span className="text-[#6B6560] truncate">{log.candidateName ?? '—'}</span>
              <span className="text-[#9C958A]">{formatDateTime(log.startedAt)}</span>
              <Badge variant={STATUS_VARIANT[log.status]}>{log.status}</Badge>
              <span className="tabular-nums text-[#6B6560]">{log.durationMs != null ? `${log.durationMs}ms` : '—'}</span>
              <span className="text-[#9C958A] truncate">{log.errorMessage ?? (log.result ? 'Completed' : '—')}</span>
            </div>
          ))}
          {!data?.length && <p className="text-sm text-[#9C958A] text-center py-12">No executions yet</p>}
        </Card>
      )}
    </div>
  );
}
