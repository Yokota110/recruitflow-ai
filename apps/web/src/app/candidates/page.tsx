import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CandidatesPage } from '@/components/candidates/candidates-page';

export default function Candidates() {
  return (
    <DashboardLayout>
      <CandidatesPage />
    </DashboardLayout>
  );
}
