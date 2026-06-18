'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { Plus, MapPin, Users, Archive } from 'lucide-react';
import { JobStatus, JOB_STATUS_LABELS, PaginatedResponse } from '@recruitflow/shared';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: JobStatus;
  employmentType: string;
  applicationCount: number;
  stageCounts: Record<string, number>;
  openedAt: string | null;
  createdAt: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

const FILTERS = ['', 'OPEN', 'DRAFT', 'PAUSED', 'ARCHIVED'];

const statusVariant = (status: JobStatus): 'success' | 'primary' | 'warning' | 'default' | 'outline' => {
  const map: Record<string, 'success' | 'primary' | 'warning' | 'default' | 'outline'> = {
    OPEN: 'success', DRAFT: 'default', PAUSED: 'warning', CLOSED: 'outline', ARCHIVED: 'outline',
  };
  return map[status] || 'default';
};

export function JobsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', statusFilter],
    queryFn: () =>
      api<PaginatedResponse<Job>>(
        `/jobs?${statusFilter ? `status=${statusFilter}&` : ''}limit=50`,
      ),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api(`/jobs/${id}/archive`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Jobs"
        description="Manage open positions and hiring pipelines"
        action={
          <Link href="/jobs/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </Link>
        }
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150',
              statusFilter === s
                ? 'bg-[#0F1419] text-[#FFFCF7] shadow-sm'
                : 'bg-[#FFFCF7] border border-[#E8E2D9] text-[#6B6560] hover:border-[#D9D3C7] hover:text-[#1A1814]',
            )}
          >
            {s ? JOB_STATUS_LABELS[s as JobStatus] : 'All Jobs'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((job) => (
            <Card key={job.id} className="hover:shadow-[0_4px_20px_rgba(15,20,25,0.08)] transition-shadow duration-200">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-display text-sm font-semibold text-[#1A1814] hover:text-[#E8653A] transition-colors"
                    >
                      {job.title}
                    </Link>
                    <Badge variant={statusVariant(job.status)}>
                      {JOB_STATUS_LABELS[job.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#9C958A]">
                    <span className="font-medium">{job.department}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    {job.openedAt && <span>Opened {formatDate(job.openedAt)}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#9C958A] font-medium">
                  <Users className="h-3.5 w-3.5" />
                  {job.applicationCount}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/jobs/${job.id}/pipeline`}>
                    <Button variant="outline" size="sm">Pipeline</Button>
                  </Link>
                  {job.status !== 'ARCHIVED' && (
                    <Button variant="ghost" size="sm" onClick={() => archiveMutation.mutate(job.id)}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {data?.data.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#9C958A] mb-4">No jobs found</p>
              <Link href="/jobs/new"><Button>Create your first job</Button></Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
