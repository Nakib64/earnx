'use client';

import React from 'react';
import { Crown, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import { GlassCard, NumericAmount } from '../design-system';

interface DashboardHeroHeaderProps {
  firstName?: string | null;
  isPremium: boolean;
  walletBalance?: number | string;
}

export function DashboardHeroHeader({
  firstName,
  isPremium,
  walletBalance,
}: DashboardHeroHeaderProps) {
  return (
    <GlassCard
      variant="elevated"
      className="p-5 sm:p-6 lg:p-7 text-slate-900 relative overflow-hidden"
    >
      {/* Subtle Ambient Mesh Sheen */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-sky-500/[0.06] blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 lg:gap-8">
        {/* Left Column: Greeting, Status & Tabular Financial Balances */}
        <div className="space-y-3.5 max-w-xl">
          {/* Greeting */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                Welcome Back
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900  flex items-center gap-2">
              <span>{firstName || 'Valued Member'}</span>
              <span className="text-xl sm:text-2xl">👋</span>
            </h1>
          </div>

          {/* Badges & Wallet Balance Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {isPremium ? (
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>Premium VIP</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                <span>Standard Member</span>
              </div>
            )}

            {walletBalance !== undefined && (
              <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200/90 text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs specular-rim">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Balance:</span>
                <NumericAmount
                  value={walletBalance}
                  size="sm"
                  className="font-bold text-slate-900"
                />
              </div>
            )}
          </div>

          {/* 24H Yield / Performance Tag */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl px-3.5 py-1.5 shadow-xs">
              <div className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>24H Yield:</span>
              </div>
              <span className="text-sm font-black text-emerald-700  tabular-nums ">
                +12.48%
              </span>
              <span className="inline-flex items-center text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                ▲ Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Artwork: Light Liquid Financial Metrics Badge */}
        <div className="hidden sm:flex items-center justify-center shrink-0">
          <div className="relative p-5 rounded-3xl bg-white/80 border border-white/95 shadow-lg shadow-slate-900/5 specular-rim text-center min-w-[200px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Liquidity
            </span>
            <div className="mt-1">
              <NumericAmount
                value={walletBalance || 0}
                size="2xl"
                semantic="gain"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-full border border-emerald-200/60">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Real-Time Secured</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
