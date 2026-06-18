'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Badge, Skeleton } from '@/components/ui/badge';
import { fetchTasks, createTask, updateTask } from '../services/crm.service';
import { TASK_TYPE_LABELS, TASK_STATUS_LABELS, TaskStatus, TaskType } from '@recruitflow/shared';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const STATUS_ICONS = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.DONE]: CheckCircle2,
};

export function TasksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', type: TaskType.REVIEW_RESUME, dueDate: '' });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => fetchTasks(filter === 'ALL' ? undefined : filter),
  });

  const createMutation = useMutation({
    mutationFn: () => createTask({ ...form, dueDate: form.dueDate || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAdd(false);
      setForm({ title: '', type: TaskType.REVIEW_RESUME, dueDate: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const cycleStatus = (id: string, current: TaskStatus) => {
    const next = current === TaskStatus.TODO ? TaskStatus.IN_PROGRESS
      : current === TaskStatus.IN_PROGRESS ? TaskStatus.DONE
      : TaskStatus.TODO;
    updateMutation.mutate({ id, status: next });
  };

  return (
    <div>
      <PageHeader
        title="Recruiter Tasks"
        description="Track calls, reviews, interviews, and offers"
        action={<Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Task</Button>}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['ALL', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              filter === s ? 'bg-[#E8653A] text-white border-[#E8653A]' : 'border-[#E8E2D9] text-[#6B6560]',
            )}
          >
            {s === 'ALL' ? 'All' : TASK_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {showAdd && (
        <Card className="p-4 mb-4 space-y-3">
          <Input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}>
            {Object.values(TaskType).map((t) => (
              <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
            ))}
          </Select>
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <Button onClick={() => createMutation.mutate()} disabled={!form.title}>Create Task</Button>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {tasks?.map((task) => {
            const Icon = STATUS_ICONS[task.status];
            return (
              <Card key={task.id}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <button
                    onClick={() => cycleStatus(task.id, task.status)}
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      task.status === TaskStatus.DONE ? 'text-[#2D8A6E]' : 'text-[#9C958A] hover:text-[#E8653A]',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold', task.status === TaskStatus.DONE && 'line-through text-[#9C958A]')}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="outline">{TASK_TYPE_LABELS[task.type]}</Badge>
                      <Badge variant={task.status === TaskStatus.DONE ? 'success' : 'default'}>
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-[10px] text-[#9C958A]">Due {formatDate(task.dueDate)}</span>
                      )}
                      {task.candidate && (
                        <Link href={`/candidates/${task.candidate.id}`} className="text-[10px] text-[#E8653A] hover:underline">
                          {task.candidate.firstName} {task.candidate.lastName}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {!tasks?.length && <Card className="p-8 text-center text-sm text-[#9C958A]">No tasks found</Card>}
        </div>
      )}
    </div>
  );
}

export function MyTasksWidget({ tasks }: { tasks: import('@recruitflow/shared').RecruiterTaskDto[] }) {
  if (!tasks.length) return null;
  return (
    <Card>
      <div className="px-5 py-4 border-b border-[#F0EBE3] flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-[#1A1814]">My Tasks</p>
        <Link href="/tasks" className="text-[10px] text-[#E8653A] font-semibold hover:underline">View all</Link>
      </div>
      <div className="divide-y divide-[#F0EBE3]">
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} className="px-5 py-3 flex items-center gap-3">
            <Circle className="h-3.5 w-3.5 text-[#E8653A] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#1A1814] truncate">{task.title}</p>
              <p className="text-[10px] text-[#9C958A]">{TASK_TYPE_LABELS[task.type]}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
