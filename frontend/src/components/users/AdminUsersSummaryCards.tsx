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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Members</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-black text-slate-900 font-mono">{totalMembers}</div>
      </div>

      <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-2xl p-4 shadow-sm space-y-1 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">Badged Leaders</span>
          <Award className="w-4 h-4 text-[#f3ba2f]" />
        </div>
        <div className="text-2xl font-black text-white font-mono">{badgedLeadersCount}</div>
      </div>

      <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-4 shadow-sm space-y-1 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Premium Accounts</span>
          <Crown className="w-4 h-4 text-[#f3ba2f]" />
        </div>
        <div className="text-2xl font-black text-amber-100 font-mono">{premiumAccountsCount}</div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Network Balance</span>
          <Wallet className="w-4 h-4 text-primary" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono truncate">
          ৳{totalNetworkBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}
