'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge, Avatar, Skeleton } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { AiInsightsPanel } from '@/components/ai/ai-insights-panel';
import { CandidateSummaryCard } from '@/features/ai/components/CandidateSummaryCard';
import { CareerAnalysisCard } from '@/features/ai/components/CareerAnalysisCard';
import { HiringRecommendationCard } from '@/features/ai/components/HiringRecommendationCard';
import { InterviewQuestionsModal } from '@/features/ai/components/InterviewQuestionsModal';
import { CandidateTimeline } from '@/features/crm/timeline/CandidateTimeline';
import { TagBadge } from '@/features/crm/components/TagBadge';
import { fetchTags, addTagToCandidate, removeTagFromCandidate } from '@/features/crm/services/crm.service';
import { Mail, MapPin, Linkedin, Pin, Briefcase, GitCompare, Plus } from 'lucide-react';
import {
  SOURCE_LABELS, PIPELINE_STAGE_LABELS, CandidateSource, PipelineStage, HiringRecommendation,
} from '@recruitflow/shared';
import { formatDate, getMatchScoreColor } from '@/lib/utils';

interface CandidateDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  source: CandidateSource;
  skills: { id: string; name: string; level: number | null }[];
  experiences: {
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }[];
  notes: {
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    author: { firstName: string; lastName: string };
  }[];
  tags?: { tag: { id: string; name: string; color: string } }[];
  applications: {
    id: string;
    stage: PipelineStage;
    matchScore: number | null;
    job: { id: string; title: string; department: string };
    candidateInsight?: {
      matchScore: number;
      skillOverlapScore: number;
      experienceScore: number;
      educationScore: number;
      seniorityScore: number;
      skillsSummary: string;
      strengths: string[];
      weaknesses: string[];
      recommendation: HiringRecommendation;
      interviewQuestions: string[];
    } | null;
  }[];
}

export function CandidateDetailPage({ candidateId }: { candidateId: string }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const { data: candidate, isLoading, isError } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => api<CandidateDetail>(`/candidates/${candidateId}`),
  });

  const { data: allTags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) =>
      api(`/candidates/${candidateId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', candidateId] });
      setNote('');
    },
  });

  const addTagMutation = useMutation({
    mutationFn: (tagId: string) => addTagToCandidate(candidateId, tagId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] }),
  });

  const removeTagMutation = useMutation({
    mutationFn: (tagId: string) => removeTagFromCandidate(candidateId, tagId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <Card className="p-12 text-center">
        <p className="text-[#1A1814] font-semibold">Candidate not found</p>
        <p className="text-sm text-[#9C958A] mt-1">This profile may have been removed.</p>
      </Card>
    );
  }

  const primaryAppId = candidate.applications[0]?.id;

  return (
    <div>
      <PageHeader
        title={`${candidate.firstName} ${candidate.lastName}`}
        description={candidate.email}
        action={
          <div className="flex gap-2 flex-wrap">
            <InterviewQuestionsModal candidateId={candidateId} applicationId={primaryAppId} />
            <Link href={`/candidates/compare?ids=${candidateId}`}>
              <Button variant="outline" size="sm">
                <GitCompare className="h-4 w-4" />
                Compare
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start gap-4">
                <Avatar name={`${candidate.firstName} ${candidate.lastName}`} size="lg" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 text-sm text-[#6B6560]">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{candidate.email}</span>
                    {candidate.phone && <span>{candidate.phone}</span>}
                    {candidate.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{candidate.location}</span>
                    )}
                    {candidate.linkedinUrl && (
                      <a href={candidate.linkedinUrl} className="flex items-center gap-1 text-[#E8653A] hover:underline">
                        <Linkedin className="h-3.5 w-3.5" />LinkedIn
                      </a>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2">{SOURCE_LABELS[candidate.source]}</Badge>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {candidate.tags?.map(({ tag }) => (
                      <TagBadge key={tag.id} tag={tag} onRemove={() => removeTagMutation.mutate(tag.id)} />
                    ))}
                    {allTags?.filter((t) => !candidate.tags?.some((ct) => ct.tag.id === t.id)).slice(0, 4).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => addTagMutation.mutate(t.id)}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-[#D9D3C7] text-[#9C958A] hover:border-[#E8653A] hover:text-[#E8653A] flex items-center gap-0.5"
                      >
                        <Plus className="h-2.5 w-2.5" /> {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CandidateSummaryCard candidateId={candidateId} />

          <CandidateTimeline candidateId={candidateId} />

          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((s) => (
                  <Badge key={s.id} variant="primary">
                    {s.name}
                    {s.level && <span className="ml-1 opacity-60">· {s.level}/5</span>}
                  </Badge>
                ))}
                {candidate.skills.length === 0 && (
                  <p className="text-sm text-[#9C958A]">No skills listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          <CareerAnalysisCard candidateId={candidateId} />

          <Card>
            <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {candidate.experiences.length === 0 ? (
                <p className="text-sm text-[#9C958A]">No experience listed</p>
              ) : (
                candidate.experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-[#F5D5C8] pl-4">
                    <p className="text-sm font-semibold text-[#1A1814]">{exp.title}</p>
                    <p className="text-sm text-[#6B6560]">{exp.company}</p>
                    <p className="text-xs text-[#9C958A] mt-0.5">
                      {formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-[#9C958A] mt-1">{exp.description}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {candidate.notes.length === 0 && (
                  <p className="text-sm text-[#9C958A]">No notes yet</p>
                )}
                {candidate.notes.map((n) => (
                  <div key={n.id} className="bg-[#F5F1EA] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {n.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                      <span className="text-xs font-medium text-[#5C574F]">
                        {n.author.firstName} {n.author.lastName}
                      </span>
                      <span className="text-xs text-[#9C958A]">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#6B6560]">{n.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={() => addNoteMutation.mutate(note)}
                  disabled={!note.trim() || addNoteMutation.isPending}
                  className="self-end"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {candidate.applications.length === 0 ? (
                <p className="text-sm text-[#9C958A]">No applications</p>
              ) : (
                candidate.applications.map((app) => (
                  <div key={app.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#F5F1EA]">
                    <Briefcase className="h-4 w-4 text-[#9C958A] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1814] truncate">{app.job.title}</p>
                      <p className="text-xs text-[#9C958A]">{PIPELINE_STAGE_LABELS[app.stage]}</p>
                    </div>
                    {(app.candidateInsight?.matchScore ?? app.matchScore) != null && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${getMatchScoreColor(app.candidateInsight?.matchScore ?? app.matchScore!)}`}>
                        {app.candidateInsight?.matchScore ?? app.matchScore}%
                      </span>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <HiringRecommendationCard candidateId={candidateId} applicationId={primaryAppId} />

          {candidate.applications.length > 0 && (
            <AiInsightsPanel applications={candidate.applications} candidateId={candidateId} />
          )}
        </div>
      </div>
    </div>
  );
}
