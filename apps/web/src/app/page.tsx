import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/layout/sidebar';
import { DashboardPage } from '@/components/dashboard/dashboard-page';

export default function HomePage() {
  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" description="Overview of your hiring pipeline" />
      <DashboardPage />
    </DashboardLayout>
  );
}
