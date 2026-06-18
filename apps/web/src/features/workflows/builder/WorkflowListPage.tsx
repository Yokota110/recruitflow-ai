'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, Skeleton } from '@/components/ui/badge';
import {
  fetchWorkflows, cloneWorkflow, deleteWorkflow, enableWorkflow, disableWorkflow,
  fetchWorkflowTemplates, installWorkflowTemplate, generateWorkflowFromPrompt, createWorkflow,
} from '../services/workflows.service';
import { graphToPayload, graphFromWorkflow } from '../canvas/WorkflowCanvas';
import { WorkflowListItem } from '@recruitflow/shared';
import {
  Plus, Copy, Trash2, Power, PowerOff, Edit, Sparkles, Download,
  BarChart3, ScrollText,
} from 'lucide-react';
import { Textarea } from '@/components/ui/input';

export function WorkflowListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAi, setShowAi] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: fetchWorkflows,
  });

  const { data: templates } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: fetchWorkflowTemplates,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['workflows'] });

  const cloneMut = useMutation({
    mutationFn: cloneWorkflow,
    onSuccess: (w) => { invalidate(); router.push(`/workflows/${w.id}`); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: invalidate,
  });

  const enableMut = useMutation({ mutationFn: enableWorkflow, onSuccess: invalidate });
  const disableMut = useMutation({ mutationFn: disableWorkflow, onSuccess: invalidate });

  const installMut = useMutation({
    mutationFn: installWorkflowTemplate,
    onSuccess: (w) => { invalidate(); router.push(`/workflows/${w.id}`); },
  });

  const aiMut = useMutation({
    mutationFn: () => generateWorkflowFromPrompt(aiPrompt),
    onSuccess: async (result) => {
      const g = graphFromWorkflow(
        result.nodes.map((n) => ({ ...n, data: n.data as Record<string, unknown> })),
        result.edges,
      );
      const w = await createWorkflow(graphToPayload(result.name, result.description, result.triggerType, g.nodes, g.edges));
      invalidate();
      router.push(`/workflows/${w.id}`);
    },
  });

  return (
    <div>
      <PageHeader
        title="Workflows"
        description="Automate hiring with triggers, conditions, and actions"
        action={
          <div className="flex gap-2 flex-wrap">
            <Link href="/workflows/logs">
              <Button variant="outline"><ScrollText className="h-4 w-4" /> Logs</Button>
            </Link>
            <Link href="/workflows/analytics">
              <Button variant="outline"><BarChart3 className="h-4 w-4" /> Analytics</Button>
            </Link>
            <Button variant="outline" onClick={() => setShowAi(!showAi)}>
              <Sparkles className="h-4 w-4" /> AI Generator
            </Button>
            <Link href="/workflows/new">
              <Button><Plus className="h-4 w-4" /> Create Workflow</Button>
            </Link>
          </div>
        }
      />

      {showAi && (
        <Card className="p-4 mb-4 space-y-3">
          <p className="text-sm font-semibold text-[#1A1814]">Generate Workflow With AI</p>
          <Textarea
            placeholder="Notify recruiter whenever a frontend candidate with 80+ score applies..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
          />
          <Button onClick={() => aiMut.mutate()} disabled={!aiPrompt.trim()}>
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
        </Card>
      )}

      {templates && templates.length > 0 && (
        <Card className="p-4 mb-6">
          <p className="text-sm font-semibold text-[#1A1814] mb-3">Workflow Templates</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map((t) => (
              <div key={t.slug} className="flex items-center justify-between p-3 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9]">
                <div>
                  <p className="text-xs font-semibold text-[#1A1814]">{t.name}</p>
                  <p className="text-[10px] text-[#9C958A] line-clamp-1">{t.description}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => installMut.mutate(t.slug)}>
                  <Download className="h-3 w-3" /> Install
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_80px_80px_120px_180px] gap-2 px-5 py-3 bg-[#F5F1EA] text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider border-b border-[#E8E2D9]">
            <span>Name</span>
            <span>Trigger</span>
            <span>Actions</span>
            <span>Status</span>
            <span>Created By</span>
            <span className="text-right">Actions</span>
          </div>
          {data?.map((w) => (
            <WorkflowRow
              key={w.id}
              workflow={w}
              onClone={() => cloneMut.mutate(w.id)}
              onDelete={() => deleteMut.mutate(w.id)}
              onEnable={() => enableMut.mutate(w.id)}
              onDisable={() => disableMut.mutate(w.id)}
            />
          ))}
          {!data?.length && (
            <p className="text-sm text-[#9C958A] text-center py-12">No workflows yet. Create one or install a template.</p>
          )}
        </Card>
      )}
    </div>
  );
}

function WorkflowRow({
  workflow: w,
  onClone,
  onDelete,
  onEnable,
  onDisable,
}: {
  workflow: WorkflowListItem;
  onClone: () => void;
  onDelete: () => void;
  onEnable: () => void;
  onDisable: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_140px_80px_80px_120px_180px] gap-2 items-center px-5 py-4 border-b border-[#F0EBE3] hover:bg-[#FAFAF8]">
      <Link href={`/workflows/${w.id}`} className="text-sm font-semibold text-[#1A1814] hover:text-[#E8653A] truncate">
        {w.name}
      </Link>
      <span className="text-xs text-[#6B6560] truncate">{w.triggerLabel}</span>
      <span className="text-xs tabular-nums text-[#6B6560]">{w.actionCount}</span>
      <Badge variant={w.enabled ? 'success' : 'outline'}>{w.enabled ? 'On' : w.status}</Badge>
      <span className="text-xs text-[#9C958A] truncate">{w.createdBy.firstName} {w.createdBy.lastName}</span>
      <div className="flex justify-end gap-1">
        <Link href={`/workflows/${w.id}`}><Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button></Link>
        <Button size="sm" variant="outline" onClick={onClone}><Copy className="h-3 w-3" /></Button>
        {w.enabled ? (
          <Button size="sm" variant="outline" onClick={onDisable}><PowerOff className="h-3 w-3" /></Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onEnable}><Power className="h-3 w-3" /></Button>
        )}
        <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}
