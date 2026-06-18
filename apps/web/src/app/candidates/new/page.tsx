import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { NewCandidatePage } from '@/components/candidates/new-candidate-page';

export default function NewCandidate() {
  return (
    <DashboardLayout>
      <NewCandidatePage />
    </DashboardLayout>
  );
}
