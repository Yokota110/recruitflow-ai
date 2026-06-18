'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { ResumeUploadModal } from '@/features/ai/components/ResumeUploadModal';
import { ArrowLeft } from 'lucide-react';

export function UploadResumePage() {
  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Upload Resume"
        description="Parse resume, extract skills, and add candidate to ATS"
        action={
          <Link href="/candidates">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <ResumeUploadModal />
    </div>
  );
}
