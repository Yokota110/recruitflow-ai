'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, Avatar } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Users, Calendar, Clock, TrendingUp, Zap, Award, ExternalLink,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import {
  DashboardV2Extended, PIPELINE_STAGE_LABELS, PipelineStage, SOURCE_LABELS,
  RecruiterTaskDto, SmartAlert,
} from '@recruitflow/shared';
import { formatDateTime, getMatchScoreColor } from '@/lib/utils';
import { theme, CHART_TOOLTIP_STYLE } from '@/lib/theme';
import { AiRecruitingInsightsWidget } from '@/features/ai/components/AiRecruitingInsightsWidget';
import { CrmProductivityWidget } from '@/features/crm/analytics/CrmProductivityWidget';
import { MyTasksWidget } from '@/features/crm/tasks/TasksPage';
import { SmartAlertsWidget } from '@/features/workflows/analytics/SmartAlertsWidget';

const STAT_ACCENTS = ['#E8653A', '#3DAA8D', '#5B8DEF', '#C4A35A', '#9B7ED9', '#2D8A6E'];

function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  suffix?: string;
  accent: string;
}) {
  return (
    <Card className="stat-card-accent overflow-hidden" style={{ '--accent-color': accent } as React.CSSProperties}>
      <CardContent className="pt-5 pb-5 pl-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-[0.12em]">{title}</p>
            <p className="font-display text-3xl font-bold text-[#1A1814] mt-2 tabular-nums">
              {value}
              {suffix && <span className="text-lg text-[#9C958A] ml-0.5 font-semibold">{suffix}</span>}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
            <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<DashboardV2Extended & {
      timeToHire?: { averageDays: number; trend: { week: string; averageDays: number; hires: number }[] };
      myTasks?: RecruiterTaskDto[];
      smartAlerts?: SmartAlert[];
    }>('/analytics/dashboard'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-12 text-center">
        <p className="font-semibold text-[#1A1814]">Unable to load dashboard</p>
        <p className="text-sm text-[#9C958A] mt-1">Please refresh to try again.</p>
      </Card>
    );
  }

  const funnelData = data.hiringFunnel.filter((s) => s.stage !== PipelineStage.REJECTED);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Open Jobs" value={data.kpis.openJobs} icon={Briefcase} accent={STAT_ACCENTS[0]} />
        <StatCard title="Active Candidates" value={data.kpis.activeCandidates} icon={Users} accent={STAT_ACCENTS[1]} />
        <StatCard title="Interviews This Week" value={data.kpis.interviewsThisWeek} icon={Calendar} accent={STAT_ACCENTS[2]} />
        <StatCard title="Time to Hire" value={data.kpis.timeToHire} suffix="d" icon={Clock} accent={STAT_ACCENTS[3]} />
        <StatCard
          title="Offer Acceptance"
          value={Math.round(data.kpis.offerAcceptanceRate * 100)}
          suffix="%"
          icon={TrendingUp}
          accent={STAT_ACCENTS[4]}
        />
        <StatCard title="Hiring Velocity" value={data.kpis.hiringVelocity} suffix="/wk" icon={Zap} accent={STAT_ACCENTS[5]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Hiring Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.chart.grid} />
                <XAxis type="number" tick={{ fontSize: 11, fill: theme.chart.axis }} />
                <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11, fill: theme.chart.axis }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={theme.chart.primary} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hiring Velocity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.hiringVelocityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: theme.chart.axis }} />
                <YAxis tick={{ fontSize: 11, fill: theme.chart.axis }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="hires"
                  stroke={theme.chart.secondary}
                  strokeWidth={2.5}
                  dot={{ fill: theme.chart.secondary, r: 4, strokeWidth: 0 }}
                  name="Hires"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <AiRecruitingInsightsWidget />

      <CrmProductivityWidget />

      {data.smartAlerts && data.smartAlerts.length > 0 && (
        <SmartAlertsWidget alerts={data.smartAlerts} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.myTasks && data.myTasks.length > 0 && (
          <MyTasksWidget tasks={data.myTasks} />
        )}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
          <CardContent className="p-0">
            {data.recentApplications.length === 0 ? (
              <p className="text-sm text-[#9C958A] text-center py-8">No recent applications</p>
            ) : (
              <div className="divide-y divide-[#F0EBE3]">
                {data.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={app.candidateName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1814] truncate">{app.candidateName}</p>
                      <p className="text-xs text-[#9C958A] truncate">
                        {app.jobTitle} · {PIPELINE_STAGE_LABELS[app.stage]}
                      </p>
                    </div>
                    {app.matchScore != null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMatchScoreColor(app.matchScore)}`}>
                        {app.matchScore}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Upcoming Interviews</CardTitle></CardHeader>
          <CardContent className="p-0">
            {data.upcomingInterviews.length === 0 ? (
              <p className="text-sm text-[#9C958A] text-center py-8">No upcoming interviews</p>
            ) : (
              <div className="divide-y divide-[#F0EBE3]">
                {data.upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1A1814] truncate">{interview.candidateName}</p>
                        <p className="text-xs text-[#9C958A] truncate">{interview.title} · {interview.jobTitle}</p>
                        <p className="text-xs text-[#6B6560] mt-0.5">{formatDateTime(interview.scheduledAt)}</p>
                      </div>
                      {interview.meetingUrl && (
                        <a
                          href={interview.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E8653A] hover:text-[#C4522A] flex-shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-[#E8653A]" />Top Recruiters</CardTitle></CardHeader>
            <CardContent>
              {data.topRecruiters.length === 0 ? (
                <p className="text-sm text-[#9C958A] text-center py-4">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.topRecruiters.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#9C958A] w-4">{i + 1}</span>
                      <Avatar name={r.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1814] truncate">{r.name}</p>
                        <p className="text-[10px] text-[#9C958A]">
                          {r.hiresClosed} hires · {r.interviewsCompleted} interviews
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Sources</CardTitle></CardHeader>
            <CardContent>
              {data.topSources.length === 0 ? (
                <p className="text-sm text-[#9C958A] text-center py-4">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {data.topSources.slice(0, 5).map((s) => (
                    <div key={s.source} className="flex items-center justify-between text-xs">
                      <span className="text-[#6B6560]">{SOURCE_LABELS[s.source]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#9C958A] tabular-nums">{s.applicants} apps</span>
                        <Badge variant="success">{s.conversionRate}%</Badge>
                      </div>
                    </div>
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
