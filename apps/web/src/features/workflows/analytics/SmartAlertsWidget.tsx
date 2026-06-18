'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { SmartAlert } from '@recruitflow/shared';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const COLORS = {
  info: '#5B8DEF',
  warning: '#C4A35A',
  danger: '#C45C5C',
};

export function SmartAlertsWidget({ alerts }: { alerts: SmartAlert[] }) {
  if (!alerts.length) return null;

  return (
    <Card>
      <div className="px-5 py-4 border-b border-[#F0EBE3]">
        <p className="font-display text-sm font-semibold text-[#1A1814]">Smart Alerts</p>
      </div>
      <div className="divide-y divide-[#F0EBE3]">
        {alerts.map((alert) => {
          const Icon = ICONS[alert.severity];
          const color = COLORS[alert.severity];
          const inner = (
            <div className="flex items-start gap-3 px-5 py-3 hover:bg-[#FAFAF8] transition-colors">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1A1814]">{alert.message}</p>
                <p className="text-[10px] text-[#9C958A] mt-0.5 capitalize">{alert.type.replace(/_/g, ' ')}</p>
              </div>
            </div>
          );
          return alert.href ? (
            <Link key={alert.id} href={alert.href}>{inner}</Link>
          ) : (
            <div key={alert.id}>{inner}</div>
          );
        })}
      </div>
    </Card>
  );
}
