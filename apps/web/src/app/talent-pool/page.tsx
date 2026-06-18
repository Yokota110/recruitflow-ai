import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TalentPoolPage } from '@/features/crm/talent-pool/TalentPoolPage';

export default function Page() {
  return (
    <DashboardLayout>
      <TalentPoolPage />
    </DashboardLayout>
  );
}
