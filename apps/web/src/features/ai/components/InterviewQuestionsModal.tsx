'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X } from 'lucide-react';
import { generateInterviewQuestions } from '../services/interview.service';
import type { InterviewQuestionSet } from '../types';

export function InterviewQuestionsModal({
  candidateId,
  applicationId,
}: {
  candidateId: string;
  applicationId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<InterviewQuestionSet | null>(null);

  const mutation = useMutation({
    mutationFn: () => generateInterviewQuestions(candidateId, applicationId),
    onSuccess: (data) => {
      setResult(data);
      setOpen(true);
    },
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        <MessageSquare className="h-4 w-4" />
        {mutation.isPending ? 'Generating...' : 'Generate Questions'}
      </Button>

      {open && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <Card className="relative w-full max-w-lg z-10 max-h-[85vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>Interview Questions</CardTitle>
                  <Badge variant="primary" className="mt-2">{result.roleTitle}</Badge>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F1EA]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <ol className="space-y-3">
                {result.questions.map((q, i) => (
                  <li key={i} className="text-sm text-[#6B6560] bg-[#F5F1EA] rounded-lg px-3 py-2.5">
                    <span className="font-semibold text-[#E8653A] mr-1">{i + 1}.</span>{q}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
