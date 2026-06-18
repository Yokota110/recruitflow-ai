import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TasksPage } from '@/features/crm/tasks/TasksPage';

export default function Page() {
  return (
    <DashboardLayout>
      <TasksPage />
    </DashboardLayout>
  );
}
