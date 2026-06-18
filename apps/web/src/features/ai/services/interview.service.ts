import { api } from '@/lib/api-client';
import type { InterviewQuestionSet } from '../types';

export async function fetchInterviewQuestions(candidateId: string, applicationId?: string) {
  return api<InterviewQuestionSet>('/ai/interview-questions', {
    method: 'POST',
    body: JSON.stringify({ candidateId, applicationId }),
  });
}

export function generateInterviewQuestions(candidateId: string, applicationId?: string) {
  return fetchInterviewQuestions(candidateId, applicationId);
}
