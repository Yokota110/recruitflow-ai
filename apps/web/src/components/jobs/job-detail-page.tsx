'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, Avatar } from '@/components/ui/badge';
import { Kanban, Users, Send, UserCheck, TrendingUp } from 'lucide-react';
import {
  JOB_STATUS_LABELS, PIPELINE_STAGE_LABELS, EMPLOYMENT_TYPE_LABELS,
  LOCATION_TYPE_LABELS, JobStatus, PipelineStage, LocationType, EmploymentType,
} from '@recruitflow/shared';
import { formatSalary, formatDate, getMatchScoreColor } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { theme, CHART_TOOLTIP_STYLE } from '@/lib/theme';

interface JobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  locationType: LocationType;
  status: JobStatus;
  employmentType: EmploymentType;
  description: string;
  requirements: string;
  salaryMin: number | null;
  salaryMax: number | null;
  openedAt: string | null;
  applicationCount: number;
  stageCounts: Record<PipelineStage, number>;
  metrics: {
    totalApplicants: number;
    activeCandidates: number;
    offersSent: number;
    hiredCount: number;
    conversionRate: number;
  };
  pipelineTrend: { week: string; applied: number; advanced: number; hired: number }[];
  hiringManager: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  applications: {
    id: string;
    stage: PipelineStage;
    matchScore: number | null;
    appliedAt: string;
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
      source: string;
    };
  }[];
}

function MetricCard({ label, value, suffix, icon: Icon }: {
  label: string;
  value: number | string;
  suffix?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-display font-bold text-[#1A1814] mt-1 tabular-nums">
              {value}{suffix}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-[#FDF0EB] flex items-center justify-center">
            <Icon className="h-4 w-4 text-[#E8653A]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobDetailPage({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api<JobDetail>(`/jobs/${jobId}`),
  });

  const publishMutation = useMutation({
    mutationFn: () => api(`/jobs/${jobId}/publish`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <Card className="p-12 text-center">
        <p className="font-semibold text-[#1A1814]">Job not found</p>
        <p className="text-sm text-[#9C958A] mt-1">This posting may have been removed.</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.department} · ${LOCATION_TYPE_LABELS[job.locationType]} · ${job.location}`}
        action={
          <div className="flex gap-2">
            {job.status === 'DRAFT' && (
              <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                Publish Job
              </Button>
            )}
            <Link href={`/jobs/${jobId}/pipeline`}>
              <Button variant="outline">
                <Kanban className="h-4 w-4" />
                Open Pipeline
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Total Applicants" value={job.metrics.totalApplicants} icon={Users} />
        <MetricCard label="Active Candidates" value={job.metrics.activeCandidates} icon={Users} />
        <MetricCard label="Offers Sent" value={job.metrics.offersSent} icon={Send} />
        <MetricCard label="Hired" value={job.metrics.hiredCount} icon={UserCheck} />
        <MetricCard label="Conversion" value={job.metrics.conversionRate} suffix="%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Status</p>
            <Badge variant={job.status === 'OPEN' ? 'success' : 'default'} className="mt-2">
              {JOB_STATUS_LABELS[job.status]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Employment</p>
            <p className="text-sm font-medium text-[#1A1814] mt-2">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Salary Range</p>
            <p className="text-sm font-medium text-[#1A1814] mt-2">{formatSalary(job.salaryMin, job.salaryMax)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Hiring Manager</p>
            {job.hiringManager ? (
              <div className="flex items-center gap-2 mt-2">
                <Avatar
                  name={`${job.hiringManager.firstName} ${job.hiringManager.lastName}`}
                  src={job.hiringManager.avatarUrl}
                  size="sm"
                />
                <p className="text-sm font-medium text-[#1A1814]">
                  {job.hiringManager.firstName} {job.hiringManager.lastName}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#9C958A] mt-2">Not assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Pipeline Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={job.pipelineTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: theme.chart.axis }} />
              <YAxis tick={{ fontSize: 11, fill: theme.chart.axis }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="applied" stroke={theme.chart.primary} strokeWidth={2} name="Applied" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="advanced" stroke={theme.chart.tertiary} strokeWidth={2} name="Advanced" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="hired" stroke={theme.chart.secondary} strokeWidth={2} name="Hired" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[#6B6560] whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[#6B6560] whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pipeline Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(job.stageCounts)
                .filter(([, count]) => count > 0)
                .map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between text-sm">
                    <span className="text-[#6B6560]">{PIPELINE_STAGE_LABELS[stage as PipelineStage]}</span>
                    <span className="font-medium text-[#1A1814] tabular-nums">{count}</span>
                  </div>
                ))}
              {Object.values(job.stageCounts).every((c) => c === 0) && (
                <p className="text-sm text-[#9C958A]">No candidates yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Applicants</CardTitle></CardHeader>
            <CardContent className="p-0">
              {job.applications.length === 0 ? (
                <p className="text-sm text-[#9C958A] text-center py-8">No applicants yet</p>
              ) : (
                <div className="divide-y divide-[#F0EBE3]">
                  {job.applications.slice(0, 8).map((app) => (
                    <Link
                      key={app.id}
                      href={`/candidates/${app.candidate.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F1EA] transition-colors"
                    >
                      <Avatar
                        name={`${app.candidate.firstName} ${app.candidate.lastName}`}
                        src={app.candidate.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1814] truncate">
                          {app.candidate.firstName} {app.candidate.lastName}
                        </p>
                        <p className="text-xs text-[#9C958A]">
                          {PIPELINE_STAGE_LABELS[app.stage]} · {formatDate(app.appliedAt)}
                        </p>
                      </div>
                      {app.matchScore != null && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${getMatchScoreColor(app.matchScore)}`}>
                          {app.matchScore}%
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
