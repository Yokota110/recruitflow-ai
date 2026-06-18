import { api } from '@/lib/api-client';
import type { ParsedResume, RecruitingInsightsResult } from '../types';

export async function parseResume(file: File) {
  const form = new FormData();
  form.append('file', file);
  return api<ParsedResume>('/ai/parse-resume', { method: 'POST', body: form });
}

export async function importResume(file: File) {
  const form = new FormData();
  form.append('file', file);
  return api<{
    candidate: { id: string; firstName: string; lastName: string };
    parsed: ParsedResume;
    summary: { professionalSummary: string };
    careerAnalysis: { message: string };
  }>('/ai/import-resume', { method: 'POST', body: form });
}

export async function fetchRecruitingInsights() {
  return api<RecruitingInsightsResult>('/ai/recruiting-insights');
}

export function generateRecruitingInsights() {
  return fetchRecruitingInsights();
}
