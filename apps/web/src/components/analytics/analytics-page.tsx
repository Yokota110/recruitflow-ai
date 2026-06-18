'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { PipelineStage, SourcePerformance, RecruiterPerformance } from '@recruitflow/shared';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { theme, CHART_TOOLTIP_STYLE } from '@/lib/theme';

interface ConversionData {
  from: PipelineStage;
  to: PipelineStage;
  fromLabel: string;
  toLabel: string;
  count: number;
  rate: number;
}

interface OfferData {
  summary: {
    total: number;
    accepted: number;
    declined: number;
    pending: number;
    acceptanceRate: number;
  };
}

interface TimeToHireData {
  averageDays: number;
  trend: { week: string; averageDays: number; hires: number }[];
}

const PIE_COLORS = ['#2D8A6E', '#C45C5C', '#C4A35A'];

export function AnalyticsPage() {
  const { data: funnel, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics-funnel'],
    queryFn: () => api<{ stage: PipelineStage; count: number; label: string }[]>('/analytics/funnel'),
  });

  const { data: sources } = useQuery({
    queryKey: ['analytics-sources'],
    queryFn: () => api<SourcePerformance[]>('/analytics/sources'),
  });

  const { data: conversion } = useQuery({
    queryKey: ['analytics-conversion'],
    queryFn: () => api<ConversionData[]>('/analytics/conversion'),
  });

  const { data: offers } = useQuery({
    queryKey: ['analytics-offers'],
    queryFn: () => api<OfferData>('/analytics/offers'),
  });

  const { data: recruiters } = useQuery({
    queryKey: ['analytics-recruiters'],
    queryFn: () => api<RecruiterPerformance[]>('/analytics/recruiters'),
  });

  const { data: velocity } = useQuery({
    queryKey: ['analytics-velocity'],
    queryFn: () => api<{ week: string; hires: number }[]>('/analytics/velocity'),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['analytics-tth'],
    queryFn: () => api<{ timeToHire: TimeToHireData }>('/analytics/dashboard'),
  });

  const funnelData = funnel?.filter((s) => s.stage !== 'REJECTED') ?? [];
  const offerPie = offers
    ? [
        { name: 'Accepted', value: offers.summary.accepted },
        { name: 'Declined', value: offers.summary.declined },
        { name: 'Pending', value: offers.summary.pending },
      ].filter((d) => d.value > 0)
    : [];

  const avgTimeToHire = dashboard?.timeToHire?.averageDays ?? 0;

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader title="Analytics" description="Executive hiring performance and conversion metrics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Time to Hire</p>
            <p className="font-display text-4xl font-bold text-[#1A1814] mt-2 tabular-nums">
              {avgTimeToHire}<span className="text-lg text-[#9C958A] ml-1">days</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Offer Acceptance</p>
            <p className="font-display text-4xl font-bold text-[#1A1814] mt-2 tabular-nums">
              {offers?.summary.acceptanceRate ?? 0}<span className="text-lg text-[#9C958A] ml-0.5">%</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Total Offers</p>
            <p className="font-display text-4xl font-bold text-[#1A1814] mt-2 tabular-nums">
              {offers?.summary.total ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Weekly Hires</p>
            <p className="font-display text-4xl font-bold text-[#1A1814] mt-2 tabular-nums">
              {velocity?.[velocity.length - 1]?.hires ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Hiring Funnel</CardTitle></CardHeader>
          <CardContent>
            {funnelLoading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.chart.axis }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: theme.chart.axis }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill={theme.chart.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Source Performance</CardTitle></CardHeader>
          <CardContent>
            {(sources?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#9C958A] text-center py-16">No source data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sources ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.chart.axis }} />
                  <YAxis tick={{ fontSize: 11, fill: theme.chart.axis }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="applicants" fill={`${theme.chart.tertiary}99`} name="Applicants" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="interviews" fill={theme.chart.primary} name="Interviews" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="hires" fill={theme.chart.secondary} name="Hires" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Stage Conversion Rates</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversion?.length === 0 && (
                <p className="text-sm text-[#9C958A] text-center py-8">No conversion data yet</p>
              )}
              {conversion?.map((c) => (
                <div key={`${c.from}-${c.to}`}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#6B6560]">{c.fromLabel} → {c.toLabel}</span>
                    <span className="font-bold text-[#1A1814] tabular-nums">{c.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${c.rate}%`, background: theme.chart.primary }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recruiter Performance</CardTitle></CardHeader>
          <CardContent>
            {(recruiters?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#9C958A] text-center py-8">No recruiter data yet</p>
            ) : (
              <div className="space-y-4">
                {recruiters?.map((r) => (
                  <div key={r.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[#1A1814]">{r.name}</span>
                      <span className="text-[#2D8A6E] font-bold">{r.hiresClosed} hires</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-[#9C958A]">
                      <span>{r.candidatesHandled} handled</span>
                      <span>{r.interviewsCompleted} interviews</span>
                      <span className="text-right">{r.hiresClosed} closed</span>
                    </div>
                    <div className="h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full bg-[#2D8A6E]"
                        style={{ width: `${Math.min(100, r.hiresClosed * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Offer Breakdown</CardTitle>
              {offers && (
                <span className="font-display text-2xl font-bold text-[#1A1814] tabular-nums">
                  {offers.summary.acceptanceRate}%
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {offerPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={offerPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {offerPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#9C958A] text-center py-8">No offers yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Hiring Velocity</CardTitle></CardHeader>
        <CardContent>
          {(velocity?.length ?? 0) === 0 ? (
            <p className="text-sm text-[#9C958A] text-center py-8">No velocity data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={velocity}>
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
                  name="Weekly Hires"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
