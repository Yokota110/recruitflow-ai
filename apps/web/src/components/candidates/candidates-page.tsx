'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge, Avatar, Skeleton } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Mail, MapPin, GitCompare, Upload } from 'lucide-react';
import { SOURCE_LABELS, CandidateSource, PaginatedResponse } from '@recruitflow/shared';
import { cn } from '@/lib/utils';
import { TagBadge, TagFilterBar } from '@/features/crm/components/TagBadge';
import { fetchTags } from '@/features/crm/services/crm.service';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string | null;
  source: CandidateSource;
  skills: { name: string; level: number | null }[];
  tags?: { tag: { id: string; name: string; color: string } }[];
  applications: { job: { title: string; id: string } }[];
}

export function CandidatesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', tagFilter],
    queryFn: () => {
      const qs = tagFilter ? `?limit=50&tag=${encodeURIComponent(tagFilter)}` : '?limit=50';
      return api<PaginatedResponse<Candidate>>(`/candidates${qs}`);
    },
  });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCompare = () => {
    if (selected.size >= 2) {
      router.push(`/candidates/compare?ids=${[...selected].join(',')}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Candidates"
        description="Browse and manage your talent pool"
        action={
          <div className="flex gap-2 flex-wrap">
            {selected.size >= 2 && (
              <Button variant="outline" onClick={handleCompare}>
                <GitCompare className="h-4 w-4" />
                Compare ({selected.size})
              </Button>
            )}
            <Link href="/candidates/upload">
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Upload Resume
              </Button>
            </Link>
            <Link href="/candidates/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Candidate
              </Button>
            </Link>
          </div>
        }
      />

      <TagFilterBar
        tags={(tags ?? []).map((t) => ({ id: t.id, name: t.name, color: t.color }))}
        selected={tagFilter}
        onSelect={setTagFilter}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((candidate) => {
            const isSelected = selected.has(candidate.id);
            return (
              <Card key={candidate.id} className={cn('hover:shadow-md transition-shadow', isSelected && 'ring-2 ring-[#E8653A]/40')}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <button
                    onClick={(e) => toggleSelect(candidate.id, e)}
                    className={cn(
                      'h-5 w-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                      isSelected ? 'bg-[#E8653A] border-[#E8653A] text-white' : 'border-[#D9D3C7] hover:border-[#E8653A]',
                    )}
                  >
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                  <Link href={`/candidates/${candidate.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar name={`${candidate.firstName} ${candidate.lastName}`} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1814]">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#9C958A] flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {candidate.email}
                        </span>
                        {candidate.location && (
                          <span className="text-xs text-[#9C958A] flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {candidate.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{SOURCE_LABELS[candidate.source]}</Badge>
                    <div className="hidden sm:flex gap-1 flex-wrap max-w-[200px]">
                      {candidate.tags?.map(({ tag }) => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                    <div className="hidden sm:flex gap-1">
                      {candidate.skills.slice(0, 3).map((s) => (
                        <Badge key={s.name} variant="default">{s.name}</Badge>
                      ))}
                    </div>
                    <span className="text-xs text-[#9C958A] hidden md:inline">
                      {candidate.applications.length} application{candidate.applications.length !== 1 ? 's' : ''}
                    </span>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
