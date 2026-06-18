import { api } from '@/lib/api-client';
import type { CandidateComparisonResult, CareerAnalysis } from '../types';

export async function compareCandidates(candidateIds: string[]) {
  return api<CandidateComparisonResult>('/ai/compare', {
    method: 'POST',
    body: JSON.stringify({ candidateIds }),
  });
}

export async function fetchCareerGaps(candidateId: string) {
  return api<CareerAnalysis>(`/ai/candidates/${candidateId}/career-gaps`);
}

export function detectCareerGaps(candidateId: string) {
  return fetchCareerGaps(candidateId);
}
