'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Badge, Avatar, Skeleton } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Video, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { PaginatedResponse, PipelineStage, PIPELINE_STAGE_LABELS } from '@recruitflow/shared';
import { formatDateTime, cn } from '@/lib/utils';

interface InterviewFeedback {
  communication: number;
  technicalSkills: number;
  cultureFit: number;
  recommendation: number;
  notes: string | null;
}

interface Interview {
  id: string;
  title: string;
  stage: PipelineStage | null;
  scheduledAt: string;
  durationMin: number;
  status: string;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  application: {
    id: string;
    candidate: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  };
  job: { id: string; title: string };
  interviewer: { firstName: string; lastName: string };
  interviewFeedback: InterviewFeedback | null;
}

interface JobOption {
  id: string;
  title: string;
}

interface JobApplications {
  applications: { id: string; candidate: { firstName: string; lastName: string } }[];
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6B6560] mb-1.5">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'h-8 w-8 rounded-lg text-xs font-bold transition-colors',
              value >= n ? 'bg-[#E8653A] text-white' : 'bg-[#F5F1EA] text-[#9C958A] hover:bg-[#F0EBE3]',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackForm({ interviewId, onDone }: { interviewId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [scores, setScores] = useState({
    communication: 3,
    technicalSkills: 3,
    cultureFit: 3,
    recommendation: 3,
  });
  const [notes, setNotes] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      api(`/interviews/${interviewId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ ...scores, notes: notes || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      onDone();
    },
  });

  return (
    <div className="mt-4 pt-4 border-t border-[#F0EBE3] space-y-4">
      <p className="text-xs font-semibold text-[#1A1814] flex items-center gap-1">
        <Star className="h-3.5 w-3.5 text-[#E8653A]" /> Interview Feedback
      </p>
      <div className="grid grid-cols-2 gap-4">
        <ScoreInput label="Communication" value={scores.communication} onChange={(v) => setScores((s) => ({ ...s, communication: v }))} />
        <ScoreInput label="Technical Skills" value={scores.technicalSkills} onChange={(v) => setScores((s) => ({ ...s, technicalSkills: v }))} />
        <ScoreInput label="Culture Fit" value={scores.cultureFit} onChange={(v) => setScores((s) => ({ ...s, cultureFit: v }))} />
        <ScoreInput label="Recommendation" value={scores.recommendation} onChange={(v) => setScores((s) => ({ ...s, recommendation: v }))} />
      </div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
      <Button size="sm" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
        Submit Feedback
      </Button>
    </div>
  );
}

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState<PipelineStage>(PipelineStage.INTERVIEW);

  const { data: jobs } = useQuery({
    queryKey: ['jobs-open-schedule'],
    queryFn: () => api<PaginatedResponse<JobOption>>('/jobs?status=OPEN&limit=50'),
  });

  const { data: jobDetail } = useQuery({
    queryKey: ['job-apps', jobId],
    queryFn: () => api<JobApplications>(`/jobs/${jobId}`),
    enabled: !!jobId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          applicationId,
          title,
          stage,
          scheduledAt: new Date(scheduledAt).toISOString(),
          meetingUrl: meetingUrl || undefined,
          notes: notes || undefined,
          durationMin: 60,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative w-full max-w-md z-10">
        <CardHeader>
          <CardTitle>Schedule Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Job</label>
            <Select value={jobId} onChange={(e) => { setJobId(e.target.value); setApplicationId(''); }}>
              <option value="">Select job...</option>
              {jobs?.data.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Candidate</label>
            <Select value={applicationId} onChange={(e) => setApplicationId(e.target.value)} disabled={!jobId}>
              <option value="">Select candidate...</option>
              {jobDetail?.applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidate.firstName} {a.candidate.lastName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Technical Interview" />
          </div>
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Stage</label>
            <Select value={stage} onChange={(e) => setStage(e.target.value as PipelineStage)}>
              {[PipelineStage.INTERVIEW, PipelineStage.FINAL_INTERVIEW, PipelineStage.SCREENING].map((s) => (
                <option key={s} value={s}>{PIPELINE_STAGE_LABELS[s]}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Date & Time</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Meeting URL</label>
            <Input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
          <div>
            <label className="text-xs text-[#9C958A] mb-1 block">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={!applicationId || !title || !scheduledAt || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarView({ interviews }: { interviews: Interview[] }) {
  const [month, setMonth] = useState(new Date());

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const interviewsByDay = useMemo(() => {
    const map: Record<number, Interview[]> = {};
    for (const iv of interviews) {
      const d = new Date(iv.scheduledAt);
      if (d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()) {
        const day = d.getDate();
        map[day] = map[day] || [];
        map[day].push(iv);
      }
    }
    return map;
  }, [interviews, month]);

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{monthLabel}</CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-[#F5F1EA] text-[#9C958A]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-[#F5F1EA] text-[#9C958A]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[10px] font-semibold text-[#9C958A] text-center py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayInterviews = interviewsByDay[day] ?? [];
            const isToday =
              day === new Date().getDate() &&
              month.getMonth() === new Date().getMonth() &&
              month.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={cn(
                  'h-16 rounded-lg border border-[#F0EBE3] p-1 overflow-hidden',
                  isToday && 'border-[#E8653A]/40 bg-[#FDF0EB]/30',
                )}
              >
                <p className={cn('text-[10px] font-semibold tabular-nums', isToday ? 'text-[#E8653A]' : 'text-[#9C958A]')}>
                  {day}
                </p>
                {dayInterviews.slice(0, 2).map((iv) => (
                  <p key={iv.id} className="text-[9px] text-[#6B6560] truncate leading-tight">
                    {iv.application.candidate.firstName.charAt(0)}. {iv.title}
                  </p>
                ))}
                {dayInterviews.length > 2 && (
                  <p className="text-[9px] text-[#E8653A]">+{dayInterviews.length - 2}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showSchedule, setShowSchedule] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api<PaginatedResponse<Interview>>('/interviews?limit=100'),
  });

  const statusVariant = (status: string) => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
      SCHEDULED: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      NO_SHOW: 'warning',
    };
    return map[status] || 'primary';
  };

  const upcoming = data?.data.filter((i) => i.status === 'SCHEDULED' && new Date(i.scheduledAt) >= new Date()) ?? [];

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Schedule, track, and evaluate candidate interviews"
        action={
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-[#E8E2D9] overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={cn('px-3 py-1.5 text-xs font-medium transition-colors', view === 'list' ? 'bg-[#E8653A] text-white' : 'text-[#6B6560] hover:bg-[#F5F1EA]')}
              >
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={cn('px-3 py-1.5 text-xs font-medium transition-colors', view === 'calendar' ? 'bg-[#E8653A] text-white' : 'text-[#6B6560] hover:bg-[#F5F1EA]')}
              >
                Calendar
              </button>
            </div>
            <Button onClick={() => setShowSchedule(true)}>
              <Plus className="h-4 w-4" />
              Schedule
            </Button>
          </div>
        }
      />

      {upcoming.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-sm">Upcoming This Week</CardTitle></CardHeader>
          <CardContent className="flex gap-3 overflow-x-auto pb-2">
            {upcoming.slice(0, 5).map((iv) => (
              <div key={iv.id} className="flex-shrink-0 w-48 rounded-xl border border-[#E8E2D9] bg-[#F5F1EA]/50 p-3">
                <p className="text-xs font-semibold text-[#1A1814] truncate">{iv.application.candidate.firstName} {iv.application.candidate.lastName}</p>
                <p className="text-[10px] text-[#9C958A] truncate">{iv.title}</p>
                <p className="text-[10px] text-[#E8653A] mt-1">{formatDateTime(iv.scheduledAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-[#C45C5C] font-medium">Failed to load interviews</p>
        </Card>
      ) : view === 'calendar' ? (
        <CalendarView interviews={data?.data ?? []} />
      ) : (
        <div className="space-y-2">
          {data?.data.map((interview) => (
            <Card key={interview.id}>
              <div className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={`${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`}
                    src={interview.application.candidate.avatarUrl}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-[#1A1814]">{interview.title}</p>
                      <Badge variant={statusVariant(interview.status)}>{interview.status}</Badge>
                      {interview.stage && (
                        <Badge variant="outline">{PIPELINE_STAGE_LABELS[interview.stage]}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6560]">
                      {interview.application.candidate.firstName}{' '}
                      {interview.application.candidate.lastName} · {interview.job.title}
                    </p>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-xs text-[#9C958A] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(interview.scheduledAt)}
                      </span>
                      <span className="text-xs text-[#9C958A] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {interview.durationMin} min
                      </span>
                      {interview.location && (
                        <span className="text-xs text-[#9C958A] flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {interview.location}
                        </span>
                      )}
                      {interview.meetingUrl && (
                        <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E8653A] flex items-center gap-1 hover:underline">
                          <Video className="h-3 w-3" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#9C958A]">Interviewer</p>
                    <p className="text-xs font-medium text-[#5C574F]">
                      {interview.interviewer.firstName} {interview.interviewer.lastName}
                    </p>
                    {interview.status === 'COMPLETED' && !interview.interviewFeedback && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setFeedbackId(feedbackId === interview.id ? null : interview.id)}
                      >
                        Add Feedback
                      </Button>
                    )}
                    {interview.interviewFeedback && (
                      <p className="text-[10px] text-[#2D8A6E] mt-1">
                        Avg {(interview.interviewFeedback.communication + interview.interviewFeedback.technicalSkills + interview.interviewFeedback.cultureFit + interview.interviewFeedback.recommendation) / 4}/5
                      </p>
                    )}
                  </div>
                </div>
                {feedbackId === interview.id && (
                  <FeedbackForm interviewId={interview.id} onDone={() => setFeedbackId(null)} />
                )}
              </div>
            </Card>
          ))}
          {data?.data.length === 0 && (
            <div className="text-center py-16 text-[#9C958A]">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No interviews scheduled</p>
              <Button className="mt-4" onClick={() => setShowSchedule(true)}>
                Schedule First Interview
              </Button>
            </div>
          )}
        </div>
      )}

      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}
    </div>
  );
}
