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
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  {
    href: '/dashboard/premium',
    icon: Crown,
    label: 'VIP & Ads',
    accent: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  {
    href: '/dashboard/marketplace',
    icon: MessageSquare,
    label: 'Marketplace',
    accent: 'bg-sky-50 text-sky-700 border-sky-200/80',
  },
  {
    href: '/dashboard/coins',
    icon: Coins,
    label: 'Solana Hub',
    accent: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
  {
    href: '/dashboard/investments',
    icon: TrendingUp,
    label: 'Invest & Grow',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  {
    href: '/dashboard/wallet',
    icon: Wallet,
    label: 'Cash Wallet',
    accent: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  {
    href: '/dashboard/referral',
    icon: Users,
    label: 'Affiliate Team',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
  {
    href: '/dashboard/leaderboard',
    icon: Trophy,
    label: 'Top 100',
    accent: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
];

export function DashboardQuickActions() {
  return (
    <div className="space-y-4">
      {/* Quick Actions Card (Liquid Glassmorphism) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5">
        {/* Header: Max 2 Content - Left: Title, Right: View All */}
        <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 ">
              Quick Actions
            </h2>
          </div>

          <Link
            href="/dashboard/wallet"
            className="text-xs font-semibold text-[#009F6B] hover:text-[#008C5F] flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Grid: 4 columns on desktop, 2 on mobile. Each Tile: Strictly Max 2 Content (Icon + Label) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {quickActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href} className="block">
                <div className="relative flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md hover:bg-white/95 border border-white/80 hover:border-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] shadow-2xs transition-all duration-200 group cursor-pointer min-h-[92px] justify-center space-y-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${item.accent}`}
                  >
                    <Icon className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#009F6B] transition-colors leading-tight">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account Settings Row: Liquid Glassmorphic Card (Max 2 Content: Left Title with Icon, Right Arrow) */}
      <Link href="/dashboard/settings" className="block">
        <div className="flex items-center justify-between bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl px-5 py-4 hover:bg-white/90 transition-all group cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100/80 border border-slate-200/80 group-hover:bg-emerald-50 text-slate-600 group-hover:text-[#009F6B] flex items-center justify-center shrink-0 transition-colors">
              <Settings className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#009F6B] transition-colors">
              Account Security &amp; Settings
            </h4>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#009F6B] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
}

export default DashboardQuickActions;
