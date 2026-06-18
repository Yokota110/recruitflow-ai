import { api } from '@/lib/api-client';
import type { CandidateSummary } from '../types';

export async function fetchCandidateSummary(candidateId: string) {
  return api<CandidateSummary>(`/ai/candidates/${candidateId}/summary`);
}

export function generateCandidateSummary(candidateId: string) {
  return fetchCandidateSummary(candidateId);
}
