'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/badge';
import {
  WorkflowCanvas, buildDefaultGraph, graphFromWorkflow, graphToPayload,
} from '../canvas/WorkflowCanvas';
import {
  fetchWorkflow, createWorkflow, updateWorkflow, generateWorkflowFromPrompt,
} from '../services/workflows.service';
import {
  WorkflowTriggerType, WORKFLOW_TRIGGER_LABELS,
} from '@recruitflow/shared';
import { Save } from 'lucide-react';

export function WorkflowBuilderPage({ workflowId }: { workflowId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !workflowId;

  const [name, setName] = useState('New Workflow');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>(WorkflowTriggerType.CANDIDATE_APPLIED);
  const graphRef = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

  const { data, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => fetchWorkflow(workflowId!),
    enabled: !!workflowId,
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDescription(data.description ?? '');
      setTriggerType(data.triggerType);
      const g = graphFromWorkflow(data.nodes, data.edges);
      graphRef.current = g;
    }
  }, [data]);

  const initialGraph = data
    ? graphFromWorkflow(data.nodes, data.edges)
    : buildDefaultGraph(triggerType);

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = graphToPayload(
        name,
        description,
        triggerType,
        graphRef.current.nodes.length ? graphRef.current.nodes : initialGraph.nodes,
        graphRef.current.edges.length ? graphRef.current.edges : initialGraph.edges,
      );
      return isNew
        ? createWorkflow(payload)
        : updateWorkflow(workflowId!, payload);
    },
    onSuccess: (w) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      if (isNew) router.replace(`/workflows/${w.id}`);
    },
  });

  if (!isNew && isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div>
      <PageHeader
        title={isNew ? 'Create Workflow' : `Edit: ${name}`}
        description="Drag nodes to design your automation flow"
        action={
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            <Save className="h-4 w-4" /> Save Workflow
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Input placeholder="Workflow name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select value={triggerType} onChange={(e) => setTriggerType(e.target.value as WorkflowTriggerType)}>
          {Object.values(WorkflowTriggerType).map((t) => (
            <option key={t} value={t}>{WORKFLOW_TRIGGER_LABELS[t]}</option>
          ))}
        </Select>
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={1} className="lg:col-span-2" />
      </div>

      <ReactFlowProvider>
        <WorkflowCanvas
          key={workflowId ?? triggerType}
          initialNodes={initialGraph.nodes}
          initialEdges={initialGraph.edges}
          onGraphChange={(nodes, edges) => { graphRef.current = { nodes, edges }; }}
        />
      </ReactFlowProvider>
    </div>
  );
}

export function AiWorkflowBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const genMut = useMutation({
    mutationFn: () => generateWorkflowFromPrompt(prompt),
    onSuccess: async (result) => {
      const payload = graphToPayload(
        result.name,
        result.description,
        result.triggerType,
        graphFromWorkflow(
          result.nodes.map((n) => ({ ...n, data: n.data as Record<string, unknown> })),
          result.edges,
        ).nodes,
        result.edges,
      );
      const w = await createWorkflow(payload);
      router.push(`/workflows/${w.id}`);
    },
  });

  return (
    <div className="max-w-xl mx-auto py-12 space-y-4">
      <h1 className="font-display text-2xl font-bold text-[#1A1814]">AI Workflow Generator</h1>
      <Textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Notify recruiter whenever a frontend candidate with 80+ score applies."
      />
      <Button onClick={() => genMut.mutate()} disabled={!prompt.trim() || genMut.isPending}>
        Generate Workflow
      </Button>
    </div>
  );
}
