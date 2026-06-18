'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchRecruitingInsights } from '../services/resume-parser.service';

const ICONS = {
  ready_for_final: TrendingUp,
  likely_offer: Users,
  rejection_risk: AlertTriangle,
  action_needed: Sparkles,
};

const SEVERITY_STYLE = {
  success: 'border-[#C2E8DC] bg-[#EBF7F3]/50',
  info: 'border-[#C8D9F5] bg-[#EDF3FD]/50',
  warning: 'border-[#EDE0C0] bg-[#FBF5E8]/50',
  danger: 'border-[#F0D0D0] bg-[#FBEEEE]/50',
};

export function AiRecruitingInsightsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiting-insights'],
    queryFn: fetchRecruitingInsights,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-[#E8653A]" />
          AI Recruiting Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-[#9C958A]">Unable to load insights.</p>
        ) : (
          <div className="space-y-2">
            {data.insights.map((insight) => {
              const Icon = ICONS[insight.type] ?? Sparkles;
              return (
                <div
                  key={insight.id}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border px-3 py-2.5',
                    SEVERITY_STYLE[insight.severity],
                  )}
                >
                  <Icon className="h-4 w-4 text-[#E8653A] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B6560] leading-relaxed">{insight.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
