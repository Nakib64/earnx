'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Sparkles,
} from 'lucide-react';
import { useDesignSystem } from '../../context/DesignSystemContext';
import { GlassCard, ShimmerSkeleton, SkeletonLine, SkeletonBadge } from '../design-system';

interface PremiumLockScreenProps {
  title?: string;
  description?: string;
}

export function PremiumLockScreen({
  title = 'Premium Membership Required',
  description = 'This feature is exclusively reserved for active EarnX Premium Members. Please upgrade your account to unlock full access across all platform modules.',
}: PremiumLockScreenProps) {
  const { isLoading } = useDesignSystem();

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

  // 1:1 Geometry Match Shimmer Skeleton Loading State
  if (isLoading) {
    return (
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in select-none">
        {/* Hero Lock Card Skeleton */}
        <GlassCard variant="elevated" className="p-6 sm:p-10 space-y-5 text-center">
          <div className="flex justify-center">
            <ShimmerSkeleton className="w-20 h-20 sm:w-24 sm:h-24" rounded="rounded-3xl" />
          </div>
          <div className="space-y-2.5 max-w-md mx-auto flex flex-col items-center">
            <SkeletonBadge className="w-36 h-6" />
            <SkeletonLine className="w-64 sm:w-80 h-7" rounded="rounded-xl" />
            <SkeletonLine className="w-full h-4" />
            <SkeletonLine className="w-4/5 h-4" />
          </div>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <ShimmerSkeleton className="w-full sm:w-52 h-12" rounded="rounded-2xl" />
            <ShimmerSkeleton className="w-full sm:w-36 h-12" rounded="rounded-2xl" />
          </div>
        </GlassCard>

        {/* Benefits Grid Skeleton */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center px-1">
            <SkeletonLine className="w-44 h-5" />
            <SkeletonLine className="w-20 h-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} variant="standard" className="p-4 sm:p-5 space-y-3">
                <ShimmerSkeleton className="w-11 h-11" rounded="rounded-2xl" />
                <SkeletonLine className="w-36 h-4" />
                <SkeletonLine className="w-full h-3" />
                <SkeletonLine className="w-4/5 h-3" />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in select-none">
      {/* ── ULTRA-PREMIUM APPLE-GRADE LIQUID GLASS HERO PAYWALL ── */}
      <GlassCard
        variant="elevated"
        className="p-6 sm:p-10 text-slate-900 relative overflow-hidden text-center"
      >
        {/* Subtle Ambient Radial Mesh Orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          {/* Animated 3D Crown + Soft Rose Lock Badge */}
          <div className="inline-flex items-center justify-center relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-[0_8px_30px_rgba(245,158,11,0.14)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] flex items-center justify-center text-amber-500 specular-rim"
            >
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400/30 text-amber-500 animate-pulse" />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Premium Access Only</span>
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-lg mx-auto">
              {description}
            </p>
          </div>

          {/* Touch-Friendly Action Navigation Buttons (Minimum 44px touch targets) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/premium"
              className="w-full sm:w-auto min-h-[44px] px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 text-white fill-white/20" />
              <span>Upgrade to VIP Package</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-white/90 hover:bg-white text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 border border-slate-200/90 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* ── PREMIUM BENEFITS OVERVIEW (Liquid Glass Grid) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <span>What You Unlock with Premium</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">6 Core Benefits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <GlassCard
                key={idx}
                variant="standard"
                className="p-4 sm:p-5 space-y-3 hover:bg-white/85 transition-all duration-200 group active:scale-[0.99] cursor-default"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{perk.title}</h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1">
                    {perk.desc}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PremiumLockScreen;
