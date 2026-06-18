import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorkflowListPage } from '@/features/workflows/builder/WorkflowListPage';

export default function Page() {
  return (
    <DashboardLayout>
      <WorkflowListPage />
    </DashboardLayout>
  );
}
