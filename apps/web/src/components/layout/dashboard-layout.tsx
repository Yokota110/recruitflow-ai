'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar, TopBar } from '@/components/layout/sidebar';
import { Skeleton } from '@/components/ui/badge';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center app-bg">
        <div className="space-y-3 w-64">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen app-bg">
      <Sidebar />
      <div className="pl-[220px] flex flex-col min-h-screen min-w-0">
        <TopBar />
        <main className="flex-1 px-7 py-6 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
