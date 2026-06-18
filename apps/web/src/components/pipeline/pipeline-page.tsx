'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Select } from '@/components/ui/input';
import { Avatar, Skeleton } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { History, X } from 'lucide-react';
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  PipelineStage,
  SOURCE_LABELS,
  CandidateSource,
  PaginatedResponse,
  PipelineHistoryEntry,
} from '@recruitflow/shared';
import { getMatchScoreColor, getMatchBorderColor, formatDate, daysInStage } from '@/lib/utils';
import { PipelineSlaPanel, SlaOverdueBadge } from '@/features/crm/analytics/PipelineSlaPanel';
import { theme } from '@/lib/theme';

interface PipelineApplication {
  id: string;
  stage: PipelineStage;
  status: string;
  matchScore: number | null;
  appliedAt: string;
  stageChangedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    source: CandidateSource;
    location: string | null;
  };
}

interface PipelineData {
  jobId: string;
  stages: {
    stage: PipelineStage;
    count: number;
    applications: PipelineApplication[];
  }[];
}

interface Job {
  id: string;
  title: string;
  status: string;
}

function CandidateCard({
  app,
  isDragging,
  onShowHistory,
}: {
  app: PipelineApplication;
  isDragging?: boolean;
  onShowHistory: (app: PipelineApplication) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: app.id,
    data: { stage: app.stage },
  });

  const borderColor = getMatchBorderColor(app.matchScore);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeftWidth: 3,
    borderLeftColor: borderColor,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#FFFCF7] rounded-xl border border-[#E8E2D9] p-3 cursor-grab active:cursor-grabbing hover:shadow-[0_4px_12px_rgba(15,20,25,0.08)] hover:border-[#D9D3C7] transition-all duration-150"
    >
      <div className="flex items-start gap-2">
        <Avatar
          name={`${app.candidate.firstName} ${app.candidate.lastName}`}
          src={app.candidate.avatarUrl}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <Link
            href={`/candidates/${app.candidate.id}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-xs font-semibold text-[#1A1814] hover:text-[#E8653A] truncate block transition-colors"
          >
            {app.candidate.firstName} {app.candidate.lastName}
          </Link>
          <p className="text-[10px] text-[#9C958A] truncate">{app.candidate.email}</p>
        </div>
        <div className="flex items-center gap-1">
          {app.matchScore != null && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMatchScoreColor(app.matchScore)}`}>
              {app.matchScore}%
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onShowHistory(app); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-0.5 rounded text-[#9C958A] hover:text-[#E8653A] hover:bg-[#F5F1EA] transition-colors"
            title="Stage history"
          >
            <History className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EBE3]">
        <span className="text-[10px] text-[#9C958A]">{SOURCE_LABELS[app.candidate.source]}</span>
        <div className="text-right">
          <p className="text-[10px] text-[#9C958A]">Applied {formatDate(app.appliedAt)}</p>
          <div className="flex items-center justify-end gap-1">
            <SlaOverdueBadge daysInStage={Math.floor((Date.now() - new Date(app.stageChangedAt).getTime()) / 86400000)} stage={app.stage} />
            <p className="text-[10px] font-medium text-[#6B6560] tabular-nums">{daysInStage(app.stageChangedAt)} in stage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  applications,
  onShowHistory,
}: {
  stage: PipelineStage;
  applications: PipelineApplication[];
  onShowHistory: (app: PipelineApplication) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const stageColor = theme.pipeline[stage] || '#9C958A';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border border-[#E8E2D9] bg-[#F5F1EA]/60 min-h-[320px] ${isOver ? 'ring-2 ring-[#E8653A]/40 bg-[#FDF0EB]/40' : ''}`}
      style={{ borderTopWidth: 3, borderTopColor: stageColor }}
    >
      <div className="px-3 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#1A1814]">
          {PIPELINE_STAGE_LABELS[stage]}
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums"
          style={{ background: `${stageColor}18`, color: stageColor }}
        >
          {applications.length}
        </span>
      </div>
      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[120px] max-h-[calc(100vh-240px)]">
          {applications.map((app) => (
            <CandidateCard key={app.id} app={app} onShowHistory={onShowHistory} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function StageHistoryPanel({
  app,
  onClose,
}: {
  app: PipelineApplication;
  onClose: () => void;
}) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['application-history', app.id],
    queryFn: () => api<PipelineHistoryEntry[]>(`/applications/${app.id}/history`),
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-[#FFFCF7] border-l border-[#E8E2D9] shadow-[-8px_0_32px_rgba(15,20,25,0.08)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#F0EBE3]">
        <div>
          <p className="font-display text-sm font-semibold text-[#1A1814]">Stage History</p>
          <p className="text-xs text-[#9C958A]">{app.candidate.firstName} {app.candidate.lastName}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F5F1EA] text-[#9C958A]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="border-l-2 border-[#E8653A] pl-3 py-1">
                <p className="text-xs font-semibold text-[#1A1814]">
                  {entry.fromStage ? PIPELINE_STAGE_LABELS[entry.fromStage] : 'New'}
                  {' → '}
                  {PIPELINE_STAGE_LABELS[entry.toStage]}
                </p>
                <p className="text-[10px] text-[#9C958A] mt-0.5">
                  {new Date(entry.changedAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </p>
                {entry.changedBy && (
                  <p className="text-[10px] text-[#6B6560] mt-0.5">
                    by {entry.changedBy.firstName} {entry.changedBy.lastName}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9C958A] text-center py-8">No stage history yet</p>
        )}
      </div>
    </div>
  );
}

export function PipelinePage({ jobId: initialJobId }: { jobId?: string }) {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [historyApp, setHistoryApp] = useState<PipelineApplication | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ['jobs-open'],
    queryFn: () => api<PaginatedResponse<Job>>('/jobs?status=OPEN&limit=50'),
  });

  const jobId = selectedJobId || jobs?.data[0]?.id || '';

  const { data: pipeline, isLoading, isError } = useQuery({
    queryKey: ['pipeline', jobId],
    queryFn: () => api<PipelineData>(`/jobs/${jobId}/pipeline`),
    enabled: !!jobId,
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) =>
      api(`/applications/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', jobId] });
      if (historyApp) {
        queryClient.invalidateQueries({ queryKey: ['application-history', historyApp.id] });
      }
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStage = over.id as PipelineStage;

    const currentApp = pipeline?.stages
      .flatMap((s) => s.applications)
      .find((a) => a.id === appId);

    if (currentApp && currentApp.stage !== newStage && PIPELINE_STAGES.includes(newStage)) {
      moveMutation.mutate({ id: appId, stage: newStage });
    }
  };

  const activeApp = activeId
    ? pipeline?.stages.flatMap((s) => s.applications).find((a) => a.id === activeId)
    : null;

  const selectedJob = jobs?.data.find((j) => j.id === jobId);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Pipeline"
        description={selectedJob ? selectedJob.title : 'Select a job to view pipeline'}
        action={
          <Select
            value={jobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-64"
          >
            {jobs?.data.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </Select>
        }
      />

      {jobId && <PipelineSlaPanel jobId={jobId} />}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[10px] text-[#9C958A]">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#2D8A6E]" /> High match (80+)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C4A35A]" /> Medium (65–79)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C45C5C]" /> Low (&lt;65)</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 pb-4">
          {PIPELINE_STAGES.map((s) => (
            <Skeleton key={s} className="h-96 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-[#C45C5C] font-medium">Failed to load pipeline</p>
          <p className="text-sm text-[#9C958A] mt-1">Please try refreshing the page.</p>
        </Card>
      ) : pipeline ? (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 pb-4">
              {pipeline.stages.map(({ stage, applications }) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  applications={applications}
                  onShowHistory={setHistoryApp}
                />
              ))}
            </div>
            <DragOverlay>
              {activeApp && <CandidateCard app={activeApp} isDragging onShowHistory={() => {}} />}
            </DragOverlay>
          </DndContext>
          {historyApp && (
            <>
              <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setHistoryApp(null)} />
              <StageHistoryPanel app={historyApp} onClose={() => setHistoryApp(null)} />
            </>
          )}
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-[#9C958A]">No open jobs found. Create a job to get started.</p>
        </Card>
      )}
    </div>
  );
}
