import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CandidateDetailPage } from '@/components/candidates/candidate-detail-page';

export default async function CandidateDetail({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  return (
    <DashboardLayout>
      <CandidateDetailPage candidateId={candidateId} />
    </DashboardLayout>
  );
}
