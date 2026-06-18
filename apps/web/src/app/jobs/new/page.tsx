import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { NewJobPage } from '@/components/jobs/new-job-page';

export default function NewJob() {
  return (
    <DashboardLayout>
      <NewJobPage />
    </DashboardLayout>
  );
}
