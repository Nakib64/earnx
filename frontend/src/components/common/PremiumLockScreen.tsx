'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Coins,
  TrendingUp,
  Users,
  Wallet,
  Trophy,
  LayoutDashboard,
  Settings,
  Sparkles,
} from 'lucide-react';

interface PremiumLockScreenProps {
  title?: string;
  description?: string;
}

export function PremiumLockScreen({
  title = 'Premium Membership Required',
  description = 'This feature is exclusively reserved for active EarnX Premium Members. Please upgrade your account to unlock full access across all platform modules.',
}: PremiumLockScreenProps) {
  const perks = [
    {
      icon: Users,
      title: '5-Tier Team Commissions',
      desc: 'Earn multi-tier commission payouts from up to 5 levels of your referral network.',
    },
    {
      icon: Wallet,
      title: 'Wallet Transfers & Withdrawals',
      desc: 'Seamless peer-to-peer balance transfers and priority cash withdrawals.',
    },
    {
      icon: Coins,
      title: 'Solana Coin Rewards',
      desc: 'Unlock premium locked bonus coins and trade Solana tokens in real-time.',
    },
    {
      icon: TrendingUp,
      title: 'Investment Packages & Returns',
      desc: 'Subscribe to high-yield investment plans and receive scheduled dividend payouts.',
    },
    {
      icon: Trophy,
      title: 'Top 100 Leaderboard',
      desc: 'Compete with global top earners and showcase your network achievements.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Premium Badge',
      desc: 'Display your exclusive gold Crown badge and priority verified status.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      {/* ── LUXURY GOLD & EMERALD HERO PAYWALL BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#01281a] via-[#011f15] to-[#00170f] border-2 border-[#d4af37]/50 p-6 sm:p-10 text-white shadow-2xl text-center">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          {/* Animated 3D Crown + Lock Badge */}
          <div className="inline-flex items-center justify-center relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#044830] to-[#011c13] border-2 border-[#d4af37] flex items-center justify-center text-[#f3ba2f] shadow-[0_0_40px_rgba(212,175,55,0.35)]">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 fill-[#f3ba2f] drop-shadow-[0_2px_10px_rgba(243,186,47,0.7)] animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase bg-amber-500/20 text-[#f3ba2f] border border-[#d4af37]/40 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Only Access</span>
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {description}
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Account Dashboard</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#023322] hover:bg-[#03442e] text-amber-200 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all border border-[#d4af37]/40 shadow-md cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#f3ba2f]" />
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── PREMIUM BENEFITS OVERVIEW ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>What You Unlock with Premium</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">6 Core Benefits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 hover:border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">{perk.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
