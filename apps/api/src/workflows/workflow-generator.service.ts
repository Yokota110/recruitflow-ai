import { Injectable } from '@nestjs/common';
import {
  WorkflowTriggerType, WorkflowNodeType, WorkflowConditionField,
  WorkflowConditionOperator, WorkflowActionType,
  GeneratedWorkflowResult,
} from '@recruitflow/shared';

@Injectable()
export class WorkflowGeneratorService {
  generateWorkflowFromPrompt(prompt: string): GeneratedWorkflowResult {
    const lower = prompt.toLowerCase();
    const scoreMatch = lower.match(/(\d+)\+?/);
    const minScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 80;

    const skillKeywords = ['frontend', 'backend', 'react', 'python', 'design', 'devops', 'ai'];
    const detectedSkill = skillKeywords.find((k) => lower.includes(k)) ?? 'candidate';

    const notifyRecruiter = lower.includes('notify') || lower.includes('alert');
    const moveStage = lower.includes('screening') || lower.includes('move');
    const sendEmail = lower.includes('email') || lower.includes('outreach');
    const createTask = lower.includes('task') || lower.includes('review');

    const triggerType = lower.includes('apply') || lower.includes('applied')
      ? WorkflowTriggerType.CANDIDATE_APPLIED
      : lower.includes('interview')
        ? WorkflowTriggerType.INTERVIEW_SCHEDULED
        : WorkflowTriggerType.CANDIDATE_APPLIED;

    const nodes: GeneratedWorkflowResult['nodes'] = [
      {
        id: 'trigger-1',
        type: WorkflowNodeType.TRIGGER,
        label: 'Candidate Applied',
        position: { x: 250, y: 0 },
        data: { triggerType },
      },
      {
        id: 'condition-1',
        type: WorkflowNodeType.CONDITION,
        label: `Match Score > ${minScore}`,
        position: { x: 250, y: 120 },
        data: {
          condition: {
            field: WorkflowConditionField.MATCH_SCORE,
            operator: WorkflowConditionOperator.GT,
            value: String(minScore),
          },
        },
      },
    ];

    const edges: GeneratedWorkflowResult['edges'] = [
      { id: 'e1', source: 'trigger-1', target: 'condition-1' },
    ];

    let y = 240;
    let prevId = 'condition-1';

    if (detectedSkill !== 'candidate') {
      const skillNodeId = 'condition-2';
      nodes.push({
        id: skillNodeId,
        type: WorkflowNodeType.CONDITION,
        label: `Skill: ${detectedSkill}`,
        position: { x: 250, y },
        data: {
          condition: {
            field: WorkflowConditionField.SKILL,
            operator: WorkflowConditionOperator.CONTAINS,
            value: detectedSkill,
          },
        },
      });
      edges.push({ id: `e-${skillNodeId}`, source: prevId, target: skillNodeId });
      prevId = skillNodeId;
      y += 120;
    }

    if (notifyRecruiter) {
      const actionId = 'action-notify';
      nodes.push({
        id: actionId,
        type: WorkflowNodeType.ACTION,
        label: 'Notify Recruiter',
        position: { x: 250, y },
        data: {
          action: {
            actionType: WorkflowActionType.NOTIFY_RECRUITER,
            params: { message: `High-match ${detectedSkill} candidate detected` },
          },
        },
      });
      edges.push({ id: 'e-notify', source: prevId, target: actionId });
      prevId = actionId;
      y += 120;
    }

    if (sendEmail) {
      const actionId = 'action-email';
      nodes.push({
        id: actionId,
        type: WorkflowNodeType.ACTION,
        label: 'Send Email',
        position: { x: 250, y },
        data: {
          action: {
            actionType: WorkflowActionType.SEND_EMAIL,
            params: { subject: 'Thank you for applying' },
          },
        },
      });
      edges.push({ id: 'e-email', source: prevId, target: actionId });
      prevId = actionId;
      y += 120;
    }

    if (createTask) {
      const actionId = 'action-task';
      nodes.push({
        id: actionId,
        type: WorkflowNodeType.ACTION,
        label: 'Create Review Task',
        position: { x: 250, y },
        data: {
          action: {
            actionType: WorkflowActionType.CREATE_TASK,
            params: { title: `Review ${detectedSkill} candidate` },
          },
        },
      });
      edges.push({ id: 'e-task', source: prevId, target: actionId });
      prevId = actionId;
      y += 120;
    }

    if (moveStage) {
      const actionId = 'action-move';
      nodes.push({
        id: actionId,
        type: WorkflowNodeType.ACTION,
        label: 'Move To Screening',
        position: { x: 250, y },
        data: {
          action: {
            actionType: WorkflowActionType.MOVE_CANDIDATE,
            params: { stage: 'SCREENING' },
          },
        },
      });
      edges.push({ id: 'e-move', source: prevId, target: actionId });
    }

    if (nodes.length === 2) {
      nodes.push({
        id: 'action-default',
        type: WorkflowNodeType.ACTION,
        label: 'Notify Recruiter',
        position: { x: 250, y: 240 },
        data: {
          action: {
            actionType: WorkflowActionType.NOTIFY_RECRUITER,
            params: { message: 'Workflow triggered' },
          },
        },
      });
      edges.push({ id: 'e-default', source: 'condition-1', target: 'action-default' });
    }

    return {
      name: `AI: ${detectedSkill.charAt(0).toUpperCase()}${detectedSkill.slice(1)} ${minScore}+ Workflow`,
      description: `Generated from: "${prompt.slice(0, 120)}"`,
      triggerType,
      nodes,
      edges,
      provider: 'mock-workflow-generator',
    };
  }
}
