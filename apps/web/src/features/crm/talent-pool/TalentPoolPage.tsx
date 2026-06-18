'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, Skeleton } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/input';
import { TagBadge, TagFilterBar } from '../components/TagBadge';
import {
  fetchTalentPool, fetchTags, createTalentPoolCandidate,
  archiveTalentPoolCandidate, moveToJob,
} from '../services/crm.service';
import { api } from '@/lib/api-client';
import { SOURCE_LABELS, PaginatedResponse } from '@recruitflow/shared';
import { Plus, Archive, Briefcase, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';

interface Job { id: string; title: string; }

export function TalentPoolPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [moveJobId, setMoveJobId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', location: '', skills: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['talent-pool', search, tagFilter],
    queryFn: () => fetchTalentPool({ search: search || undefined, tag: tagFilter ?? undefined }),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs-open'],
    queryFn: () => api<PaginatedResponse<Job>>('/jobs?status=OPEN&limit=50'),
    enabled: !!moveJobId,
  });

  const createMutation = useMutation({
    mutationFn: () => createTalentPoolCandidate({
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-pool'] });
      setShowAdd(false);
      setForm({ firstName: '', lastName: '', email: '', location: '', skills: '' });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveTalentPoolCandidate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['talent-pool'] }),
  });

  const moveMutation = useMutation({
    mutationFn: ({ candidateId, jobId }: { candidateId: string; jobId: string }) =>
      moveToJob(candidateId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-pool'] });
      setMoveJobId(null);
    },
  });

  return (
    <div>
      <PageHeader
        title="Talent Pool"
        description="Candidates not currently attached to jobs — nurture and convert when ready"
        action={
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4" /> Add Candidate
          </Button>
        }
      />

      {showAdd && (
        <Card className="p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Input placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <Button onClick={() => createMutation.mutate()} disabled={!form.firstName || !form.email}>
            Save to Talent Pool
          </Button>
        </Card>
      )}

      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <TagFilterBar
        tags={(tags ?? []).map((t) => ({ id: t.id, name: t.name, color: t.color }))}
        selected={tagFilter}
        onSelect={setTagFilter}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 px-5 py-4">
                <Link href={`/candidates/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar name={`${c.firstName} ${c.lastName}`} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1814]">{c.firstName} {c.lastName}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-[#9C958A] flex items-center gap-1">
                        <Mail className="h-3 w-3" />{c.email}
                      </span>
                      {c.location && (
                        <span className="text-xs text-[#9C958A] flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{c.location}
                        </span>
                      )}
                      {c.yearsExperience != null && (
                        <span className="text-xs text-[#9C958A]">{c.yearsExperience} yrs exp</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {c.tags.map((t) => <TagBadge key={t.id} tag={t} />)}
                    </div>
                  </div>
                  <span className="text-xs text-[#9C958A]">{SOURCE_LABELS[c.source]}</span>
                  {c.lastContactedAt && (
                    <span className="text-[10px] text-[#9C958A] hidden md:block">
                      Last contacted {formatDate(c.lastContactedAt)}
                    </span>
                  )}
                </Link>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setMoveJobId(c.id)}>
                    <Briefcase className="h-3.5 w-3.5" /> Move to Job
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => archiveMutation.mutate(c.id)}>
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {!data?.data.length && (
            <Card className="p-8 text-center text-sm text-[#9C958A]">No talent pool candidates found</Card>
          )}
        </div>
      )}

      {moveJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="w-96 p-5 space-y-4">
            <p className="font-semibold text-[#1A1814]">Move to Job</p>
            <Select
              value=""
              onChange={(e) => {
                if (e.target.value) moveMutation.mutate({ candidateId: moveJobId, jobId: e.target.value });
              }}
            >
              <option value="">Select a job...</option>
              {jobs?.data.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </Select>
            <Button variant="outline" onClick={() => setMoveJobId(null)}>Cancel</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
