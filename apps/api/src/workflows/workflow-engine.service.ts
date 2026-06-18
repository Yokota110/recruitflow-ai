import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  WorkflowTriggerType, WorkflowNodeType, WorkflowExecutionStatus,
  WorkflowConditionField, WorkflowConditionOperator, WorkflowActionType,
  PipelineStage, TaskType, TaskStatus, TalentPoolStatus,
  NotificationType, NotificationCategory, NotificationPriority, Prisma,
} from '@prisma/client';
import { WORKFLOW_TRIGGER_LABELS } from '@recruitflow/shared';

export interface WorkflowTriggerPayload {
  organizationId: string;
  triggerType: WorkflowTriggerType;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async dispatch(payload: WorkflowTriggerPayload): Promise<void> {
    const workflows = await this.prisma.workflow.findMany({
      where: {
        organizationId: payload.organizationId,
        enabled: true,
        triggerType: payload.triggerType,
      },
      include: {
        nodes: { include: { condition: true, action: true } },
        edges: true,
      },
    });

    for (const workflow of workflows) {
      try {
        await this.executeWorkflow(workflow, payload);
      } catch (err) {
        this.logger.error(`Workflow ${workflow.id} failed: ${err}`);
      }
    }
  }

  private async executeWorkflow(
    workflow: {
      id: string;
      name: string;
      organizationId: string;
      nodes: Array<{
        nodeKey: string;
        type: WorkflowNodeType;
        label: string;
        condition: { field: WorkflowConditionField; operator: WorkflowConditionOperator; value: string } | null;
        action: { actionType: WorkflowActionType; params: Prisma.JsonValue } | null;
      }>;
      edges: Array<{ sourceKey: string; targetKey: string }>;
    },
    payload: WorkflowTriggerPayload,
  ) {
    const start = Date.now();
    const execution = await this.prisma.workflowExecution.create({
      data: {
        organizationId: payload.organizationId,
        workflowId: workflow.id,
        candidateId: payload.candidateId,
        status: WorkflowExecutionStatus.PENDING,
      },
    });

    const context = await this.buildContext(payload);
    const results: Record<string, unknown>[] = [];

    try {
      const triggerNode = workflow.nodes.find((n) => n.type === WorkflowNodeType.TRIGGER);
      if (!triggerNode) throw new Error('No trigger node');

      const visited = new Set<string>();
      await this.walkNode(workflow, triggerNode.nodeKey, context, payload, results, visited);

      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.SUCCESS,
          completedAt: new Date(),
          durationMs: Date.now() - start,
          result: results as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.FAILED,
          completedAt: new Date(),
          durationMs: Date.now() - start,
          errorMessage: message,
        },
      });
    }
  }

  private async walkNode(
    workflow: {
      nodes: Array<{
        nodeKey: string;
        type: WorkflowNodeType;
        label: string;
        condition: { field: WorkflowConditionField; operator: WorkflowConditionOperator; value: string } | null;
        action: { actionType: WorkflowActionType; params: Prisma.JsonValue } | null;
      }>;
      edges: Array<{ sourceKey: string; targetKey: string }>;
    },
    nodeKey: string,
    context: Record<string, unknown>,
    payload: WorkflowTriggerPayload,
    results: Record<string, unknown>[],
    visited: Set<string>,
  ) {
    if (visited.has(nodeKey)) return;
    visited.add(nodeKey);

    const node = workflow.nodes.find((n) => n.nodeKey === nodeKey);
    if (!node) return;

    if (node.type === WorkflowNodeType.CONDITION && node.condition) {
      const pass = this.evaluateCondition(node.condition, context);
      if (!pass) {
        results.push({ node: nodeKey, type: 'condition', passed: false });
        return;
      }
      results.push({ node: nodeKey, type: 'condition', passed: true });
    }

    if (node.type === WorkflowNodeType.ACTION && node.action) {
      const result = await this.executeAction(node.action, payload);
      results.push({ node: nodeKey, type: 'action', action: node.action.actionType, result });
    }

    const outEdges = workflow.edges.filter((e) => e.sourceKey === nodeKey);
    for (const edge of outEdges) {
      await this.walkNode(workflow, edge.targetKey, context, payload, results, visited);
    }
  }

  private async buildContext(payload: WorkflowTriggerPayload): Promise<Record<string, unknown>> {
    const ctx: Record<string, unknown> = { ...payload.metadata };

    if (payload.candidateId) {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: payload.candidateId },
        include: { skills: true },
      });
      if (candidate) {
        ctx.location = candidate.location ?? '';
        ctx.experience = candidate.yearsExperience ?? 0;
        ctx.source = candidate.source;
        ctx.skills = candidate.skills.map((s) => s.name);
      }
    }

    if (payload.applicationId) {
      const app = await this.prisma.application.findUnique({
        where: { id: payload.applicationId },
        include: { job: true },
      });
      if (app) {
        ctx.matchScore = app.matchScore ?? 0;
        ctx.stage = app.stage;
        ctx.jobTitle = app.job.title;
      }
    }

    return ctx;
  }

  private evaluateCondition(
    condition: { field: WorkflowConditionField; operator: WorkflowConditionOperator; value: string },
    context: Record<string, unknown>,
  ): boolean {
    let actual: unknown;
    switch (condition.field) {
      case WorkflowConditionField.MATCH_SCORE:
        actual = Number(context.matchScore ?? 0);
        break;
      case WorkflowConditionField.LOCATION:
        actual = String(context.location ?? '');
        break;
      case WorkflowConditionField.EXPERIENCE:
        actual = Number(context.experience ?? 0);
        break;
      case WorkflowConditionField.SKILL:
        actual = (context.skills as string[]) ?? [];
        break;
      case WorkflowConditionField.JOB_TITLE:
        actual = String(context.jobTitle ?? '');
        break;
      case WorkflowConditionField.SOURCE:
        actual = String(context.source ?? '');
        break;
      case WorkflowConditionField.STAGE:
        actual = String(context.stage ?? '');
        break;
      default:
        return false;
    }

    const expected = condition.value;
    const numExpected = Number(expected);
    const isNumeric = !Number.isNaN(numExpected) && expected.trim() !== '';

    switch (condition.operator) {
      case WorkflowConditionOperator.GT:
        return Number(actual) > numExpected;
      case WorkflowConditionOperator.GTE:
        return Number(actual) >= numExpected;
      case WorkflowConditionOperator.LT:
        return Number(actual) < numExpected;
      case WorkflowConditionOperator.LTE:
        return Number(actual) <= numExpected;
      case WorkflowConditionOperator.EQ:
        if (Array.isArray(actual)) {
          return actual.some((s) => s.toLowerCase() === expected.toLowerCase());
        }
        return isNumeric
          ? Number(actual) === numExpected
          : String(actual).toLowerCase() === expected.toLowerCase();
      case WorkflowConditionOperator.NEQ:
        return String(actual).toLowerCase() !== expected.toLowerCase();
      case WorkflowConditionOperator.CONTAINS:
        if (Array.isArray(actual)) {
          return actual.some((s) => s.toLowerCase().includes(expected.toLowerCase()));
        }
        return String(actual).toLowerCase().includes(expected.toLowerCase());
      default:
        return false;
    }
  }

  private async executeAction(
    action: { actionType: WorkflowActionType; params: Prisma.JsonValue },
    payload: WorkflowTriggerPayload,
  ): Promise<Record<string, unknown>> {
    const params = (action.params ?? {}) as Record<string, unknown>;

    switch (action.actionType) {
      case WorkflowActionType.NOTIFY_RECRUITER:
        await this.notifications.notifyOrgRecruiters(
          payload.organizationId,
          NotificationType.STAGE_CHANGED,
          'Workflow Alert',
          String(params.message ?? `Workflow triggered: ${WORKFLOW_TRIGGER_LABELS[payload.triggerType]}`),
          { workflow: true, ...payload.metadata },
          NotificationCategory.WORKFLOW,
          NotificationPriority.HIGH,
        );
        return { notified: true };

      case WorkflowActionType.SEND_EMAIL:
        return { sent: true, mock: true, subject: params.subject ?? 'Automated email' };

      case WorkflowActionType.CREATE_TASK: {
        const member = await this.prisma.organizationMember.findFirst({
          where: { organizationId: payload.organizationId },
        });
        if (!member) return { skipped: true };
        await this.prisma.recruiterTask.create({
          data: {
            organizationId: payload.organizationId,
            assigneeId: member.userId,
            candidateId: payload.candidateId,
            title: String(params.title ?? 'Workflow task'),
            type: TaskType.OTHER,
            status: TaskStatus.TODO,
          },
        });
        return { taskCreated: true };
      }

      case WorkflowActionType.MOVE_CANDIDATE: {
        if (!payload.applicationId) return { skipped: true };
        const stage = (params.stage as PipelineStage) ?? PipelineStage.SCREENING;
        await this.prisma.application.update({
          where: { id: payload.applicationId },
          data: { stage, stageChangedAt: new Date() },
        });
        return { movedTo: stage };
      }

      case WorkflowActionType.SCHEDULE_INTERVIEW:
        return { scheduled: true, mock: true };

      case WorkflowActionType.GENERATE_AI_ANALYSIS:
        return { analysisGenerated: true, mock: true };

      case WorkflowActionType.ADD_TAG: {
        if (!payload.candidateId) return { skipped: true };
        const tagName = String(params.tagName ?? 'Automated');
        let tag = await this.prisma.tag.findUnique({
          where: { organizationId_name: { organizationId: payload.organizationId, name: tagName } },
        });
        if (!tag) {
          tag = await this.prisma.tag.create({
            data: { organizationId: payload.organizationId, name: tagName },
          });
        }
        await this.prisma.candidateTag.upsert({
          where: { candidateId_tagId: { candidateId: payload.candidateId, tagId: tag.id } },
          create: { candidateId: payload.candidateId, tagId: tag.id },
          update: {},
        });
        return { tagAdded: tagName };
      }

      case WorkflowActionType.ARCHIVE_CANDIDATE: {
        if (!payload.candidateId) return { skipped: true };
        await this.prisma.candidate.update({
          where: { id: payload.candidateId },
          data: { poolStatus: TalentPoolStatus.ARCHIVED },
        });
        return { archived: true };
      }

      default:
        return { skipped: true };
    }
  }
}
