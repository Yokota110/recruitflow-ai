'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
  Connection, Node, Edge, Handle, Position, NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  WorkflowNodeType, WorkflowTriggerType, WorkflowActionType,
  WORKFLOW_TRIGGER_LABELS, WORKFLOW_ACTION_LABELS,
} from '@recruitflow/shared';
import { Zap, GitBranch, Play } from 'lucide-react';

function TriggerNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-[#E8653A] bg-[#FDF0EB] min-w-[180px] shadow-sm">
      <Handle type="source" position={Position.Bottom} className="!bg-[#E8653A]" />
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-[#E8653A]" />
        <div>
          <p className="text-[10px] font-semibold text-[#E8653A] uppercase">Trigger</p>
          <p className="text-xs font-semibold text-[#1A1814]">{data.label as string}</p>
        </div>
      </div>
    </div>
  );
}

function ConditionNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-[#5B8DEF] bg-[#EFF4FD] min-w-[180px] shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-[#5B8DEF]" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#5B8DEF]" />
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-[#5B8DEF]" />
        <div>
          <p className="text-[10px] font-semibold text-[#5B8DEF] uppercase">Condition</p>
          <p className="text-xs font-semibold text-[#1A1814]">{data.label as string}</p>
        </div>
      </div>
    </div>
  );
}

function ActionNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-[#2D8A6E] bg-[#EDF7F3] min-w-[180px] shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-[#2D8A6E]" />
      <div className="flex items-center gap-2">
        <Play className="h-4 w-4 text-[#2D8A6E]" />
        <div>
          <p className="text-[10px] font-semibold text-[#2D8A6E] uppercase">Action</p>
          <p className="text-xs font-semibold text-[#1A1814]">{data.label as string}</p>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

export interface CanvasGraph {
  nodes: Node[];
  edges: Edge[];
}

function toFlowType(type: WorkflowNodeType): string {
  if (type === WorkflowNodeType.TRIGGER) return 'trigger';
  if (type === WorkflowNodeType.CONDITION) return 'condition';
  return 'action';
}

function fromFlowType(type: string): WorkflowNodeType {
  if (type === 'trigger') return WorkflowNodeType.TRIGGER;
  if (type === 'condition') return WorkflowNodeType.CONDITION;
  return WorkflowNodeType.ACTION;
}

export function buildDefaultGraph(triggerType: WorkflowTriggerType): CanvasGraph {
  return {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 0 },
        data: { label: WORKFLOW_TRIGGER_LABELS[triggerType], triggerType },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 130 },
        data: { label: 'Match Score > 80', condition: { field: 'MATCH_SCORE', operator: 'GT', value: '80' } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 260 },
        data: { label: WORKFLOW_ACTION_LABELS[WorkflowActionType.NOTIFY_RECRUITER], action: { actionType: WorkflowActionType.NOTIFY_RECRUITER, params: {} } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2', source: 'condition-1', target: 'action-1' },
    ],
  };
}

export function graphFromWorkflow(
  nodes: Array<{ id: string; type: WorkflowNodeType; label: string; position: { x: number; y: number }; data: Record<string, unknown> }>,
  edges: Array<{ id: string; source: string; target: string }>,
): CanvasGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: toFlowType(n.type),
      position: n.position,
      data: { label: n.label, ...n.data },
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  };
}

export function graphToPayload(
  name: string,
  description: string,
  triggerType: WorkflowTriggerType,
  nodes: Node[],
  edges: Edge[],
) {
  return {
    name,
    description,
    triggerType,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: fromFlowType(n.type ?? 'action'),
      label: String(n.data.label ?? n.id),
      x: n.position.x,
      y: n.position.y,
      triggerType: n.type === 'trigger' ? triggerType : undefined,
      condition: n.data.condition as { field: string; operator: string; value: string } | undefined,
      action: n.data.action as { actionType: string; params?: Record<string, unknown> } | undefined,
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  };
}

interface WorkflowCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onGraphChange?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({ initialNodes, initialEdges, onGraphChange, readOnly }: WorkflowCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const next = addEdge(connection, eds);
        onGraphChange?.(nodes, next);
        return next;
      });
    },
    [nodes, onGraphChange, setEdges],
  );

  const handleNodesChange = useCallback(
    (...args: Parameters<typeof onNodesChange>) => {
      onNodesChange(...args);
      setTimeout(() => onGraphChange?.(nodes, edges), 0);
    },
    [onNodesChange, onGraphChange, nodes, edges],
  );

  return (
    <div className="h-[520px] w-full rounded-2xl border border-[#E8E2D9] bg-[#FAFAF8] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background color="#E8E2D9" gap={16} />
        <Controls className="!bg-[#FFFCF7] !border-[#E8E2D9] !shadow-sm" />
        <MiniMap className="!bg-[#FFFCF7] !border-[#E8E2D9]" />
      </ReactFlow>
    </div>
  );
}

export function useWorkflowCanvas(initial: CanvasGraph) {
  return useMemo(() => initial, [initial]);
}
