import { api } from '@/lib/api-client';
import {
  WorkflowListItem, WorkflowDetail, WorkflowExecutionDto, WorkflowAnalytics,
  WorkflowTemplateDto, GeneratedWorkflowResult,
} from '@recruitflow/shared';

export type CreateWorkflowPayload = {
  name: string;
  description?: string;
  triggerType: string;
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    triggerType?: string;
    condition?: { field: string; operator: string; value: string };
    action?: { actionType: string; params?: Record<string, unknown> };
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
  viewport?: { x: number; y: number; zoom: number };
};

export async function fetchWorkflows() {
  return api<WorkflowListItem[]>('/workflows');
}

export async function fetchWorkflow(id: string) {
  return api<WorkflowDetail>(`/workflows/${id}`);
}

export async function createWorkflow(data: CreateWorkflowPayload) {
  return api<WorkflowDetail>('/workflows', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWorkflow(id: string, data: CreateWorkflowPayload) {
  return api<WorkflowDetail>(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function cloneWorkflow(id: string) {
  return api<WorkflowDetail>(`/workflows/${id}/clone`, { method: 'POST' });
}

export async function deleteWorkflow(id: string) {
  return api(`/workflows/${id}`, { method: 'DELETE' });
}

export async function enableWorkflow(id: string) {
  return api(`/workflows/${id}/enable`, { method: 'PATCH' });
}

export async function disableWorkflow(id: string) {
  return api(`/workflows/${id}/disable`, { method: 'PATCH' });
}

export async function fetchWorkflowLogs() {
  return api<WorkflowExecutionDto[]>('/workflows/logs');
}

export async function fetchWorkflowAnalytics() {
  return api<WorkflowAnalytics>('/workflows/analytics');
}

export async function fetchWorkflowTemplates() {
  return api<WorkflowTemplateDto[]>('/workflows/templates');
}

export async function installWorkflowTemplate(slug: string) {
  return api<WorkflowDetail>('/workflows/templates/install', {
    method: 'POST',
    body: JSON.stringify({ slug }),
  });
}

export async function generateWorkflowFromPrompt(prompt: string) {
  return api<GeneratedWorkflowResult>('/workflows/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}
