import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorkflowBuilderPage } from '@/features/workflows/builder/WorkflowBuilderPage';

export default function Page() {
  return (
    <DashboardLayout>
      <WorkflowBuilderPage />
    </DashboardLayout>
  );
}
