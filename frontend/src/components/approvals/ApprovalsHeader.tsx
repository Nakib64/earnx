'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCheck, Star, ShieldCheck } from 'lucide-react';

interface ApprovalsHeaderProps {
  activationCount?: number;
  premiumCount?: number;
}

export default function ApprovalsHeader({
  activationCount = 0,
  premiumCount = 0,
}: ApprovalsHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    {
      href: '/admin/approvals/activations',
      label: 'User Activations',
      icon: UserCheck,
      count: activationCount,
    },
    {
      href: '/admin/approvals/premium',
      label: 'Premium Upgrades',
      icon: Star,
      count: premiumCount,
    },
  ];

  const totalPending = activationCount + premiumCount;

  return (
    <div className="space-y-4">
      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Approvals Queue & Distribution
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Review pending user activation & premium requests and automatically distribute referral commissions upon approval.
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-700/50 text-secondary border border-emerald-500/30 font-mono shrink-0 hidden sm:inline-flex">
            {totalPending} Pending
          </span>
        </div>
      </div>

      {/* Tabs Bar Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all ${
                isActive
                  ? 'bg-[#005A36] text-white shadow-sm font-black'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-secondary' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-lg text-[9px] font-mono font-extrabold ${
                    isActive
                      ? 'bg-emerald-700 text-secondary border border-emerald-500/30'
                      : 'bg-amber-50 text-[#854D0E] border border-amber-200'
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
