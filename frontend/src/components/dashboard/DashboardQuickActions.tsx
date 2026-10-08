'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ChevronRight,
  ArrowDownCircle,
  Crown,
  MessageSquare,
  Coins,
  TrendingUp,
  Wallet,
  Users,
  Trophy,
  Settings,
} from 'lucide-react';

export const quickActions = [
  {
    href: '/dashboard/deposit',
    icon: ArrowDownCircle,
    label: 'Deposit Funds',
    desc: 'Instant bKash/Nagad',
  },
  {
    href: '/dashboard/premium',
    icon: Crown,
    label: 'VIP Watch & Earn',
    desc: 'Daily Ads & Rewards',
  },
  {
    href: '/dashboard/marketplace',
    icon: MessageSquare,
    label: 'Marketplace Feed',
    desc: 'Posts & Discussion',
  },
  {
    href: '/dashboard/coins',
    icon: Coins,
    label: 'Solana Hub',
    desc: 'Hold & Coin Transfer',
  },
  {
    href: '/dashboard/investments',
    icon: TrendingUp,
    label: 'Invest & Grow',
    desc: 'Guaranteed Dividends',
  },
  {
    href: '/dashboard/wallet',
    icon: Wallet,
    label: 'Cash Wallet',
    desc: 'Ledger & Withdrawals',
  },
  {
    href: '/dashboard/referral',
    icon: Users,
    label: 'Affiliate Team',
    desc: 'Commission Report',
  },
  {
    href: '/dashboard/leaderboard',
    icon: Trophy,
    label: 'Top 100',
    desc: 'Leaderboard Ranking',
  },
];

export function DashboardQuickActions() {
  return (
    <div className="space-y-4">
      {/* Quick Actions Card */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-black tracking-tight">Quick Actions</h2>
          </div>

          <Link
            href="/dashboard/wallet"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {quickActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="relative overflow-hidden flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#032e1f] via-[#012216] to-[#01140c] border border-emerald-800/40 hover:border-emerald-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)] transition-all group cursor-pointer"
              >
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#fbbf24] group-hover:scale-110 transition-transform mb-1.5">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-[11px] sm:text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-center gap-0.5 leading-tight text-center">
                  <span>{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-300 shrink-0" />
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account Settings Row */}
      <Link
        href="/dashboard/settings"
        className="flex items-center justify-between bg-[#e2f5ea] hover:bg-[#d8f0e2] border border-[#bbf0d0] rounded-2xl px-4 sm:px-5 py-3.5 shadow-xs transition-all group cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#059669] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Account Setting
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Profile & Security</p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-[#059669] group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
