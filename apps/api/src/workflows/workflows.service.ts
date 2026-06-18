import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWorkflowDto, UpdateWorkflowDto, WorkflowNodeInputDto,
} from './dto/workflow.dto';
import {
  WorkflowStatus, WorkflowNodeType, Prisma, WorkflowExecutionStatus,
} from '@prisma/client';
import {
  WORKFLOW_TRIGGER_LABELS,
} from '@recruitflow/shared';
import type {
  WorkflowDetail, WorkflowListItem, WorkflowExecutionDto, WorkflowAnalytics, WorkflowCanvasNode,
} from '@recruitflow/shared';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string): Promise<WorkflowListItem[]> {
    const workflows = await this.prisma.workflow.findMany({
      where: { organizationId: orgId, status: { not: WorkflowStatus.ARCHIVED } },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        nodes: { where: { type: WorkflowNodeType.ACTION } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return workflows.map((w) => ({
      id: w.id,
      name: w.name,
      triggerType: w.triggerType as WorkflowListItem['triggerType'],
      triggerLabel: WORKFLOW_TRIGGER_LABELS[w.triggerType as keyof typeof WORKFLOW_TRIGGER_LABELS],
      actionCount: w.nodes.length,
      status: w.status as WorkflowListItem['status'],
      enabled: w.enabled,
      createdBy: w.createdBy,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }));
  }

  async findOne(orgId: string, id: string): Promise<WorkflowDetail> {
    const w = await this.prisma.workflow.findFirst({
      where: { id, organizationId: orgId },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        nodes: { include: { condition: true, action: true } },
        edges: true,
      },
    });
    if (!w) throw new NotFoundException('Workflow not found');
    return this.mapDetail(w);
  }

  async create(orgId: string, userId: string, dto: CreateWorkflowDto) {
    const workflow = await this.prisma.workflow.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        description: dto.description,
        triggerType: dto.triggerType,
        createdById: userId,
        viewport: dto.viewport as Prisma.InputJsonValue,
        status: WorkflowStatus.DRAFT,
      },
    });
    await this.saveGraph(workflow.id, dto.nodes, dto.edges);
    return this.findOne(orgId, workflow.id);
  }

  async update(orgId: string, id: string, dto: UpdateWorkflowDto) {
    await this.ensure(orgId, id);
    await this.prisma.workflow.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        triggerType: dto.triggerType,
        viewport: dto.viewport as Prisma.InputJsonValue,
      },
    });
    await this.prisma.workflowNode.deleteMany({ where: { workflowId: id } });
    await this.prisma.workflowEdge.deleteMany({ where: { workflowId: id } });
    await this.saveGraph(id, dto.nodes, dto.edges);
    return this.findOne(orgId, id);
  }

  async clone(orgId: string, userId: string, id: string) {
    const source = await this.findOne(orgId, id);
    return this.create(orgId, userId, {
      name: `${source.name} (Copy)`,
      description: source.description ?? undefined,
      triggerType: source.triggerType,
      nodes: source.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        x: n.position.x,
        y: n.position.y,
        triggerType: n.data.triggerType,
        condition: n.data.condition,
        action: n.data.action,
      })),
      edges: source.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      viewport: source.viewport ?? undefined,
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensure(orgId, id);
    await this.prisma.workflow.delete({ where: { id } });
    return { success: true };
  }

  async enable(orgId: string, id: string) {
    await this.ensure(orgId, id);
    return this.prisma.workflow.update({
      where: { id },
      data: { enabled: true, status: WorkflowStatus.ACTIVE },
    });
  }

  async disable(orgId: string, id: string) {
    await this.ensure(orgId, id);
    return this.prisma.workflow.update({
      where: { id },
      data: { enabled: false, status: WorkflowStatus.DISABLED },
    });
  }

  async getExecutions(orgId: string): Promise<WorkflowExecutionDto[]> {
    const executions = await this.prisma.workflowExecution.findMany({
      where: { organizationId: orgId },
      include: {
        workflow: { select: { name: true } },
        candidate: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    return executions.map((e) => ({
      id: e.id,
      workflowId: e.workflowId,
      workflowName: e.workflow.name,
      candidateId: e.candidateId,
      candidateName: e.candidate ? `${e.candidate.firstName} ${e.candidate.lastName}` : null,
      status: e.status as WorkflowExecutionDto['status'],
      startedAt: e.startedAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
      durationMs: e.durationMs,
      result: e.result as Record<string, unknown> | null,
      errorMessage: e.errorMessage,
    }));
  }

  async getAnalytics(orgId: string): Promise<WorkflowAnalytics> {
    const executions = await this.prisma.workflowExecution.findMany({
      where: { organizationId: orgId },
      include: { workflow: { select: { id: true, name: true } } },
      orderBy: { startedAt: 'desc' },
      take: 500,
    });

    const total = executions.length;
    const success = executions.filter((e) => e.status === WorkflowExecutionStatus.SUCCESS).length;
    const failed = executions.filter((e) => e.status === WorkflowExecutionStatus.FAILED).length;
    const withDuration = executions.filter((e) => e.durationMs != null);
    const avgMs = withDuration.length
      ? Math.round(withDuration.reduce((s, e) => s + e.durationMs!, 0) / withDuration.length)
      : 0;

    const byWorkflow = new Map<string, { name: string; total: number; success: number; durations: number[] }>();
    for (const e of executions) {
      const entry = byWorkflow.get(e.workflowId) ?? { name: e.workflow.name, total: 0, success: 0, durations: [] };
      entry.total++;
      if (e.status === WorkflowExecutionStatus.SUCCESS) entry.success++;
      if (e.durationMs) entry.durations.push(e.durationMs);
      byWorkflow.set(e.workflowId, entry);
    }

    const topWorkflows = [...byWorkflow.entries()]
      .map(([id, d]) => ({
        id,
        name: d.name,
        executions: d.total,
        successRate: d.total ? Math.round((d.success / d.total) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 5);

    const workflowPerformance = [...byWorkflow.values()]
      .map((d) => ({
        name: d.name,
        avgMs: d.durations.length ? Math.round(d.durations.reduce((a, b) => a + b, 0) / d.durations.length) : 0,
        count: d.total,
      }))
      .slice(0, 6);

    const dailyMap = new Map<string, { success: number; failed: number }>();
    for (const e of executions) {
      const date = e.startedAt.toISOString().slice(0, 10);
      const day = dailyMap.get(date) ?? { success: 0, failed: 0 };
      if (e.status === WorkflowExecutionStatus.SUCCESS) day.success++;
      if (e.status === WorkflowExecutionStatus.FAILED) day.failed++;
      dailyMap.set(date, day);
    }

    const dailyExecutions = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, d]) => ({ date, ...d }));

    return {
      totalExecutions: total,
      successRate: total ? Math.round((success / total) * 100) / 100 : 0,
      failureCount: failed,
      averageRuntimeMs: avgMs,
      topWorkflows,
      dailyExecutions,
      workflowPerformance,
    };
  }

  async getTemplates() {
    return this.prisma.workflowTemplate.findMany({ orderBy: { name: 'asc' } });
  }

  async installTemplate(orgId: string, userId: string, slug: string) {
    const template = await this.prisma.workflowTemplate.findUnique({ where: { slug } });
    if (!template) throw new NotFoundException('Template not found');

    const def = template.definition as unknown as {
      nodes: WorkflowNodeInputDto[];
      edges: { id: string; source: string; target: string }[];
      viewport?: { x: number; y: number; zoom: number };
    };

    return this.create(orgId, userId, {
      name: template.name,
      description: template.description,
      triggerType: template.triggerType,
      nodes: def.nodes,
      edges: def.edges,
      viewport: def.viewport,
    });
  }

  private async saveGraph(
    workflowId: string,
    nodes: WorkflowNodeInputDto[],
    edges: { id: string; source: string; target: string }[],
  ) {
    for (const n of nodes) {
      const node = await this.prisma.workflowNode.create({
        data: {
          workflowId,
          nodeKey: n.id,
          type: n.type,
          label: n.label,
          positionX: n.x,
          positionY: n.y,
          config: {
            triggerType: n.triggerType,
            condition: n.condition,
            action: n.action,
          } as Prisma.InputJsonValue,
        },
      });

      if (n.condition) {
        await this.prisma.workflowCondition.create({
          data: { nodeId: node.id, ...n.condition },
        });
      }
      if (n.action) {
        await this.prisma.workflowAction.create({
          data: {
            nodeId: node.id,
            actionType: n.action.actionType,
            params: (n.action.params ?? {}) as Prisma.InputJsonValue,
          },
        });
      }
    }

    if (edges.length) {
      await this.prisma.workflowEdge.createMany({
        data: edges.map((e) => ({
          workflowId,
          edgeKey: e.id,
          sourceKey: e.source,
          targetKey: e.target,
        })),
      });
    }
  }

  private mapDetail(w: {
    id: string;
    name: string;
    description: string | null;
    triggerType: import('@prisma/client').WorkflowTriggerType;
    status: WorkflowStatus;
    enabled: boolean;
    viewport: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    createdBy: { id: string; firstName: string; lastName: string };
    nodes: Array<{
      nodeKey: string;
      type: WorkflowNodeType;
      label: string;
      positionX: number;
      positionY: number;
      condition: { field: import('@prisma/client').WorkflowConditionField; operator: import('@prisma/client').WorkflowConditionOperator; value: string } | null;
      action: { actionType: import('@prisma/client').WorkflowActionType; params: Prisma.JsonValue } | null;
    }>;
    edges: Array<{ edgeKey: string; sourceKey: string; targetKey: string }>;
  }): WorkflowDetail {
    const nodes = w.nodes.map((n) => ({
      id: n.nodeKey,
      type: n.type,
      label: n.label,
      position: { x: n.positionX, y: n.positionY },
      data: {
        triggerType: w.triggerType,
        condition: n.condition ?? undefined,
        action: n.action
          ? { actionType: n.action.actionType, params: n.action.params as Record<string, unknown> }
          : undefined,
      },
    })) as WorkflowCanvasNode[];

    return {
      id: w.id,
      name: w.name,
      description: w.description,
      triggerType: w.triggerType as WorkflowDetail['triggerType'],
      triggerLabel: WORKFLOW_TRIGGER_LABELS[w.triggerType as keyof typeof WORKFLOW_TRIGGER_LABELS],
      actionCount: w.nodes.filter((n) => n.type === WorkflowNodeType.ACTION).length,
      status: w.status as WorkflowDetail['status'],
      enabled: w.enabled,
      createdBy: w.createdBy,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      viewport: w.viewport as WorkflowDetail['viewport'],
      nodes,
      edges: w.edges.map((e) => ({ id: e.edgeKey, source: e.sourceKey, target: e.targetKey })),
    };
  }

  private async ensure(orgId: string, id: string) {
    const w = await this.prisma.workflow.findFirst({ where: { id, organizationId: orgId } });
    if (!w) throw new NotFoundException('Workflow not found');
    return w;
  }
}
