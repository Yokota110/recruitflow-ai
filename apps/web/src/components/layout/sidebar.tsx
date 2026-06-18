'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  Calendar,
  BarChart3,
  LogOut,
  Zap,
  Database,
  Mail,
  CheckSquare,
  Workflow,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { GlobalSearch } from '@/features/crm/search/GlobalSearch';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/ui/badge';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/talent-pool', label: 'Talent Pool', icon: Database },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/interviews', label: 'Interviews', icon: Calendar },
  { href: '/outreach', label: 'Outreach', icon: Mail },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col bg-[#0F1419]">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8653A] shadow-[0_0_16px_rgba(232,101,58,0.4)]">
          <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-[#FFFCF7] tracking-tight">RecruitFlow</p>
          <p className="text-[9px] font-semibold text-[#E8653A] uppercase tracking-[0.15em]">AI Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-[#4A5568] uppercase tracking-[0.12em]">
          Workspace
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-white/[0.08] text-[#FFFCF7] nav-active-glow'
                  : 'text-[#78716C] hover:bg-white/[0.04] hover:text-[#D6D0C8]',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active ? 'text-[#E8653A]' : 'text-[#57534E] group-hover:text-[#A8A29E]',
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#FFFCF7] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-[#57534E] truncate">{user?.organizationName}</p>
          </div>
          <button
            onClick={logout}
            className="text-[#57534E] hover:text-[#E8653A] transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopBar() {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E8E2D9] bg-[#FFFCF7]/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#9C958A] hidden sm:block">{today}</span>
        <NotificationBell />
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-7 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1A1814] tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#9C958A] mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
