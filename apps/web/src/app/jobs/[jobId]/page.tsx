import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { JobDetailPage } from '@/components/jobs/job-detail-page';

export default async function JobDetail({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (
    <DashboardLayout>
      <JobDetailPage jobId={jobId} />
    </DashboardLayout>
  );
}
