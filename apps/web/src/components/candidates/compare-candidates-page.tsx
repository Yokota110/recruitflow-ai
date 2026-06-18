'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/badge';
import { CandidateComparisonTable } from '@/features/ai/components/CandidateComparisonTable';
import { compareCandidates } from '@/features/ai/services/comparison.service';
import { ArrowLeft } from 'lucide-react';

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['compare', ids.join(',')],
    queryFn: () => compareCandidates(ids),
    enabled: ids.length >= 2,
  });

  if (ids.length < 2) {
    return (
      <div className="text-center py-16">
        <p className="text-[#1A1814] font-semibold">Select at least 2 candidates to compare</p>
        <Link href="/candidates">
          <Button className="mt-4">Go to Candidates</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-[#C45C5C] text-center py-12">Failed to compare candidates.</p>;
  }

  return <CandidateComparisonTable data={data} />;
}

export function CompareCandidatesPage() {
  return (
    <div>
      <PageHeader
        title="Compare Candidates"
        description="Side-by-side AI-powered candidate analysis"
        action={
          <Link href="/candidates">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-48 rounded-xl" />}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
