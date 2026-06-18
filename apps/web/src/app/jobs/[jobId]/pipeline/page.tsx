import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PipelinePage } from '@/components/pipeline/pipeline-page';

export default async function JobPipeline({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (
    <DashboardLayout>
      <PipelinePage jobId={jobId} />
    </DashboardLayout>
  );
}
