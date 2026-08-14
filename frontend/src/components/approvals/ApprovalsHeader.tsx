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
      {/* Top Banner — Dark Emerald & Gold Luxury Banner */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#f3ba2f]" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Approvals Queue & Distribution
            </h1>
            <p className="text-xs text-slate-300 font-semibold">
              Review pending user activation & premium requests and automatically distribute referral commissions upon approval.
            </p>
          </div>
          <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-[#03442e] text-amber-200 border border-[#d4af37]/40 font-mono shrink-0 hidden sm:inline-flex">
            {totalPending} Pending
          </span>
        </div>
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
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                isActive
                  ? 'bg-[#01281a] text-amber-200 border border-[#d4af37]/50 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#f3ba2f]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black ${
                    isActive
                      ? 'bg-[#03442e] text-amber-200 border border-[#d4af37]/40'
                      : 'bg-amber-100 text-[#854D0E] border border-amber-300'
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
