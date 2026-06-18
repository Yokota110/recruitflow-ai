import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorkflowLogsPage } from '@/features/workflows/logs/WorkflowLogsPage';

export default function Page() {
  return (
    <DashboardLayout>
      <WorkflowLogsPage />
    </DashboardLayout>
  );
}
