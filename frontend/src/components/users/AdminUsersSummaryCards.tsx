'use client';

import React from 'react';
import { Users, Award, Crown, Wallet } from 'lucide-react';

interface AdminUsersSummaryCardsProps {
  totalMembers: number;
  badgedLeadersCount: number;
  premiumAccountsCount: number;
  totalNetworkBalance: number;
}

export function AdminUsersSummaryCards({
  totalMembers,
  badgedLeadersCount,
  premiumAccountsCount,
  totalNetworkBalance,
}: AdminUsersSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 select-none">
      {/* Box 1: Total Members */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Members</span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {totalMembers}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Registered accounts
          </span>
        </div>
      </div>

      {/* Box 2: Badged Leaders */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Badged Leaders</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
            {badgedLeadersCount}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Designated team leaders
          </span>
        </div>
      </div>

      {/* Box 3: Premium Accounts */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Premium Members</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Crown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
            {premiumAccountsCount}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Active VIP status
          </span>
        </div>
      </div>

      {/* Box 4: Network Balance */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Network Balance</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums truncate block">
            ৳{totalNetworkBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Combined member funds
          </span>
        </div>
      </div>
    </div>
  );
}
