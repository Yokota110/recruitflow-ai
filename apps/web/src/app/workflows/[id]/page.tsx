import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorkflowBuilderPage } from '@/features/workflows/builder/WorkflowBuilderPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <WorkflowBuilderPage workflowId={id} />
    </DashboardLayout>
  );
}
