import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PipelinePage } from '@/components/pipeline/pipeline-page';

export default function Pipeline() {
  return (
    <DashboardLayout>
      <PipelinePage />
    </DashboardLayout>
  );
}
