import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OutreachPage } from '@/features/crm/outreach/OutreachPage';

export default function Page() {
  return (
    <DashboardLayout>
      <OutreachPage />
    </DashboardLayout>
  );
}
