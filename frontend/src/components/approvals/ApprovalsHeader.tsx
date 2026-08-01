'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCheck, Star, DollarSign } from 'lucide-react';

interface ApprovalsHeaderProps {
  activationCount?: number;
  premiumCount?: number;
  withdrawalCount?: number;
}

export default function ApprovalsHeader({
  activationCount = 0,
  premiumCount = 0,
  withdrawalCount = 0,
}: ApprovalsHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    {
      href: '/admin/approvals/activations',
      label: 'User Activations',
      icon: UserCheck,
      count: activationCount,
      color: 'sky',
    },
    {
      href: '/admin/approvals/premium',
      label: 'Premium Upgrades',
      icon: Star,
      count: premiumCount,
      color: 'amber',
    },
    {
      href: '/admin/approvals/withdrawals',
      label: 'Withdrawal Requests',
      icon: DollarSign,
      count: withdrawalCount,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approvals & Commission Distribution</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pending user requests and automatically distribute multi-level referral commissions upon approval.
        </p>
      </div>

      {/* Tabs Bar Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
