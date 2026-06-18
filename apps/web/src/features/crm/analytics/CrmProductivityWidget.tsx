'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { fetchCrmProductivity } from '../services/crm.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_TOOLTIP_STYLE, theme } from '@/lib/theme';
import { Mail, CheckCircle, Calendar, Send } from 'lucide-react';

export function CrmProductivityWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['crm-productivity'],
    queryFn: fetchCrmProductivity,
  });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data) return null;

  const stats = [
    { label: 'Contacted', value: data.candidatesContacted, icon: Mail, color: '#E8653A' },
    { label: 'Tasks Done', value: data.tasksCompleted, icon: CheckCircle, color: '#2D8A6E' },
    { label: 'Interviews', value: data.interviewsScheduled, icon: Calendar, color: '#5B8DEF' },
    { label: 'Offers Sent', value: data.offersSent, icon: Send, color: '#9B7ED9' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">{label}</p>
                  <p className="font-display text-2xl font-bold text-[#1A1814] mt-1">{value}</p>
                </div>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: theme.chart.axis }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: theme.chart.axis }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="contacted" fill="#E8653A" name="Contacted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tasks" fill="#2D8A6E" name="Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill="#5B8DEF" name="Interviews" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recruiter Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recruiterPerformance.slice(0, 4).map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#9C958A] w-4">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1A1814]">{r.name}</p>
                    <p className="text-[10px] text-[#9C958A]">
                      {r.contacted} contacted · {r.tasksCompleted} tasks · {r.interviews} interviews
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
