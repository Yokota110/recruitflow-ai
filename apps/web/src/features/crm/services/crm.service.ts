import { api } from '@/lib/api-client';
import {
  PaginatedResponse, TalentPoolCandidate, TagDto, GlobalSearchResult,
  TimelineEventDto, EmailTemplateDto, OutreachCampaignDto, RecruiterTaskDto,
  CrmProductivityMetrics, PipelineSlaMetrics, TemplatePreviewResult,
  TaskType, TaskStatus, EmailTemplateType,
} from '@recruitflow/shared';

export async function fetchTalentPool(params?: { search?: string; tag?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.tag) qs.set('tag', params.tag);
  if (params?.page) qs.set('page', String(params.page));
  qs.set('limit', String(params?.limit ?? 50));
  return api<PaginatedResponse<TalentPoolCandidate>>(`/crm/talent-pool?${qs}`);
}

export async function createTalentPoolCandidate(data: {
  firstName: string; lastName: string; email: string;
  location?: string; source?: string; yearsExperience?: number;
  skills?: string[]; tags?: string[];
}) {
  return api<TalentPoolCandidate>('/crm/talent-pool', { method: 'POST', body: JSON.stringify(data) });
}

export async function archiveTalentPoolCandidate(id: string) {
  return api(`/crm/talent-pool/${id}/archive`, { method: 'PATCH' });
}

export async function moveToJob(candidateId: string, jobId: string) {
  return api(`/crm/talent-pool/${candidateId}/move-to-job`, {
    method: 'POST', body: JSON.stringify({ jobId }),
  });
}

export async function fetchTags() {
  return api<(TagDto & { _count?: { candidates: number } })[]>('/crm/tags');
}

export async function createTag(name: string, color?: string) {
  return api<TagDto>('/crm/tags', { method: 'POST', body: JSON.stringify({ name, color }) });
}

export async function addTagToCandidate(candidateId: string, tagId: string) {
  return api(`/crm/candidates/${candidateId}/tags`, {
    method: 'POST', body: JSON.stringify({ tagId }),
  });
}

export async function removeTagFromCandidate(candidateId: string, tagId: string) {
  return api(`/crm/candidates/${candidateId}/tags/${tagId}`, { method: 'DELETE' });
}

export async function fetchTimeline(candidateId: string) {
  return api<TimelineEventDto[]>(`/crm/candidates/${candidateId}/timeline`);
}

export async function fetchTemplates() {
  return api<EmailTemplateDto[]>('/crm/templates');
}

export async function createTemplate(data: {
  name: string; subject: string; body: string; type: EmailTemplateType;
}) {
  return api<EmailTemplateDto>('/crm/templates', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTemplate(id: string, data: Partial<{
  name: string; subject: string; body: string; type: EmailTemplateType;
}>) {
  return api<EmailTemplateDto>(`/crm/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function previewTemplate(data: {
  subject: string; body: string;
  candidateName?: string; jobTitle?: string; companyName?: string; interviewDate?: string;
}) {
  return api<TemplatePreviewResult>('/crm/templates/preview', {
    method: 'POST', body: JSON.stringify(data),
  });
}

export async function fetchCampaigns() {
  return api<OutreachCampaignDto[]>('/crm/outreach');
}

export async function createCampaign(data: {
  name: string; templateId: string; candidateIds: string[]; sendDate?: string;
}) {
  return api('/crm/outreach', { method: 'POST', body: JSON.stringify(data) });
}

export async function sendCampaign(id: string) {
  return api(`/crm/outreach/${id}/send`, { method: 'POST' });
}

export async function fetchTasks(status?: TaskStatus) {
  const qs = status ? `?status=${status}` : '';
  return api<RecruiterTaskDto[]>(`/crm/tasks${qs}`);
}

export async function fetchMyTasks() {
  return api<RecruiterTaskDto[]>('/crm/tasks/my');
}

export async function createTask(data: {
  title: string; type?: TaskType; description?: string; candidateId?: string; dueDate?: string;
}) {
  return api<RecruiterTaskDto>('/crm/tasks', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTask(id: string, data: {
  title?: string; status?: TaskStatus; type?: TaskType; dueDate?: string;
}) {
  return api<RecruiterTaskDto>(`/crm/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function globalSearch(q: string) {
  return api<GlobalSearchResult>(`/crm/search?q=${encodeURIComponent(q)}&limit=8`);
}

export async function fetchCrmProductivity() {
  return api<CrmProductivityMetrics>('/crm/analytics/productivity');
}

export async function fetchPipelineSla(jobId?: string) {
  const qs = jobId ? `?jobId=${jobId}` : '';
  return api<PipelineSlaMetrics>(`/crm/analytics/pipeline-sla${qs}`);
}
