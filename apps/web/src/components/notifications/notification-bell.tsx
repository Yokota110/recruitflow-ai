'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Bell, Check, CheckCheck, Archive } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import {
  NOTIFICATION_TYPE_LABELS, NOTIFICATION_CATEGORY_LABELS,
  NotificationType, NotificationCategory, NotificationPriority, NotificationDto,
} from '@recruitflow/shared';

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  LOW: '#9C958A',
  NORMAL: '#6B6560',
  HIGH: '#C4A35A',
  URGENT: '#C45C5C',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const queryClient = useQueryClient();

  const { data: count = 0 } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api<number>('/notifications/unread-count'),
    refetchInterval: 30000,
  });

  const qs = category !== 'ALL' ? `?category=${category}` : '';
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', category],
    queryFn: () => api<NotificationDto[]>(`/notifications${qs}`),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => api('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/archive`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  const categories: (NotificationCategory | 'ALL')[] = ['ALL', ...Object.values(NotificationCategory)];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg text-[#9C958A] hover:text-[#1A1814] hover:bg-[#F5F1EA] transition-colors"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E8653A] text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 z-50 rounded-2xl border border-[#E8E2D9] bg-[#FFFCF7] shadow-[0_8px_32px_rgba(15,20,25,0.12)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE3]">
              <p className="font-display text-sm font-semibold text-[#1A1814]">Notifications</p>
              {count > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-[#E8653A] hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-[#F0EBE3]">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-medium',
                    category === c ? 'bg-[#E8653A] text-white' : 'bg-[#F5F1EA] text-[#6B6560]',
                  )}
                >
                  {c === 'ALL' ? 'All' : NOTIFICATION_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-[#9C958A] text-center py-8">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'px-4 py-3 border-b border-[#F0EBE3] hover:bg-[#FAFAF8] transition-colors',
                      !n.read && 'bg-[#FDF0EB]/40',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#E8653A] mt-1.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-[#1A1814]">{n.title}</p>
                          <span
                            className="text-[9px] font-bold uppercase"
                            style={{ color: PRIORITY_COLORS[n.priority] }}
                          >
                            {n.priority}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6560] mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[#9C958A] mt-1">
                          {NOTIFICATION_CATEGORY_LABELS[n.category]} · {NOTIFICATION_TYPE_LABELS[n.type as NotificationType]} · {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!n.read && (
                          <button onClick={() => markRead.mutate(n.id)} className="p-1 text-[#9C958A] hover:text-[#E8653A]">
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button onClick={() => archive.mutate(n.id)} className="p-1 text-[#9C958A] hover:text-[#6B6560]">
                          <Archive className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
