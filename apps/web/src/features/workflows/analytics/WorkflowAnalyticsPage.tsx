'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { fetchWorkflowAnalytics } from '../services/workflows.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { CHART_TOOLTIP_STYLE, theme } from '@/lib/theme';
import { ArrowLeft } from 'lucide-react';

export function WorkflowAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['workflow-analytics'],
    queryFn: fetchWorkflowAnalytics,
  });

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Analytics"
        description="Execution metrics and performance"
        action={
          <Link href="/workflows" className="text-sm text-[#E8653A] hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Executions" value={data.totalExecutions} />
        <StatCard label="Success Rate" value={`${Math.round(data.successRate * 100)}%`} />
        <StatCard label="Failures" value={data.failureCount} />
        <StatCard label="Avg Runtime" value={`${data.averageRuntimeMs}ms`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Daily Executions</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.dailyExecutions}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="success" fill="#2D8A6E" name="Success" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#C45C5C" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Workflow Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.workflowPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="avgMs" stroke={theme.chart.primary} strokeWidth={2} name="Avg ms" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Workflows</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topWorkflows.map((w, i) => (
              <div key={w.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#9C958A] w-4">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1814]">{w.name}</p>
                  <p className="text-[10px] text-[#9C958A]">{w.executions} runs · {Math.round(w.successRate * 100)}% success</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">{label}</p>
        <p className="font-display text-2xl font-bold text-[#1A1814] mt-1 tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
