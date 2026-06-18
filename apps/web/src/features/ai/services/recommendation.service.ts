import { api } from '@/lib/api-client';
import type { CopilotHiringRecommendation } from '../types';

export async function fetchHiringRecommendation(candidateId: string, applicationId?: string) {
  const query = applicationId ? `?applicationId=${applicationId}` : '';
  return api<CopilotHiringRecommendation>(`/ai/candidates/${candidateId}/hiring-recommendation${query}`);
}

export function generateHiringRecommendation(candidateId: string, applicationId?: string) {
  return fetchHiringRecommendation(candidateId, applicationId);
}
