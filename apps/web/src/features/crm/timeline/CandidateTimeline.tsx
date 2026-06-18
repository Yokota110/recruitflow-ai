'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTimeline } from '../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/badge';
import { TIMELINE_EVENT_LABELS, TimelineEventType } from '@recruitflow/shared';
import { formatDate } from '@/lib/utils';
import {
  FileText, MessageSquare, Calendar, Sparkles, ArrowRight, Mail, Tag, CheckCircle, UserPlus,
} from 'lucide-react';

const EVENT_ICONS: Partial<Record<TimelineEventType, React.ElementType>> = {
  RESUME_RECEIVED: FileText,
  NOTE_ADDED: MessageSquare,
  INTERVIEW_SCHEDULED: Calendar,
  AI_ANALYSIS: Sparkles,
  STAGE_CHANGED: ArrowRight,
  EMAIL_SENT: Mail,
  TAG_ADDED: Tag,
  TASK_COMPLETED: CheckCircle,
  OUTREACH: Mail,
  OFFER_SENT: Mail,
  CANDIDATE_ADDED: UserPlus,
};

export function CandidateTimeline({ candidateId }: { candidateId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['timeline', candidateId],
    queryFn: () => fetchTimeline(candidateId),
  });

  return (
    <Card>
      <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : !data?.length ? (
          <p className="text-sm text-[#9C958A] text-center py-6">No activity yet</p>
        ) : (
          <div className="space-y-0">
            {data.map((event, i) => {
              const Icon = EVENT_ICONS[event.type] ?? MessageSquare;
              return (
                <div key={event.id} className="flex gap-3 pb-4 relative">
                  {i < data.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[#E8E2D9]" />
                  )}
                  <div className="h-8 w-8 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] flex items-center justify-center flex-shrink-0 z-10">
                    <Icon className="h-3.5 w-3.5 text-[#E8653A]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1A1814]">
                        {event.title || TIMELINE_EVENT_LABELS[event.type]}
                      </p>
                      <span className="text-[10px] text-[#9C958A] flex-shrink-0">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-[#6B6560] mt-0.5 line-clamp-2">{event.description}</p>
                    )}
                    {event.actor && (
                      <p className="text-[10px] text-[#9C958A] mt-0.5">
                        by {event.actor.firstName} {event.actor.lastName}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
