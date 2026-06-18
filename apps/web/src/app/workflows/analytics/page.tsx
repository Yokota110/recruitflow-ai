import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorkflowAnalyticsPage } from '@/features/workflows/analytics/WorkflowAnalyticsPage';

export default function Page() {
  return (
    <DashboardLayout>
      <WorkflowAnalyticsPage />
    </DashboardLayout>
  );
}
