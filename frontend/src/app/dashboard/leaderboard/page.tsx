'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  TrendingUp,
  Users,
  Trophy,
  RefreshCw,
  Flame,
  Wallet,
} from 'lucide-react';
import { useLeaderboardOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import {
  LeaderboardPodium,
  LeaderboardGrid,
  LeaderboardSkeleton,
} from '../../../components/leaderboard';

export default function UserLeaderboardPage() {
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
  const {
    state: {
      leaderboard,
      loadingInitial,
      loadingMore,
      hasMore,
      searchQuery,
      observerTarget,
    },
    computed: {
      top1,
      top2,
      top3,
    },
    actions: {
      setSearchQuery,
      getPhotoUrl,
      refresh,
    },
  } = useLeaderboardOrchestrator();

  if (forceSkeletonLoading || (loadingInitial && leaderboard.length === 0)) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
        <LeaderboardSkeleton />
      </div>
    );
  }

  // Summary Metrics adhering strictly to "Max 2 Content Per Card" Rule
  const championName = top1?.name || (loadingInitial ? 'Loading...' : 'None');
  const championProfit = Number(top1?.profit_earned || 0);
  const totalPodiumYield =
    Number(top1?.profit_earned || 0) +
    Number(top2?.profit_earned || 0) +
    Number(top3?.profit_earned || 0);
  const totalRankedCount = leaderboard.length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-900 pb-16 animate-fade-in select-none">
      {/* 1. Compact, Clearly Structured Page Header (sitting directly on background) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
            Hall of Fame &amp; Leaders
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900  leading-tight">
            Community Hall of Fame &amp; Rankings
          </h1>

          <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
            Verified top community investors, highest yield earners, and lifetime podium champions.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#009F6B]" />
              Status:{' '}
              <strong className="text-slate-900 font-semibold">Live Audited Ranks</strong>
              <span className="text-slate-400">•</span>
              <span>{totalRankedCount > 0 ? `${totalRankedCount} Leaders Active` : '100 Leaders Ranked'}</span>
            </span>
          </div>
        </div>

        {/* Secondary Actions with Liquid Glassmorphism */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Link
            href="/dashboard/investments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#009F6B]" />
            <span>Investments</span>
          </Link>

          <Link
            href="/dashboard/premium"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Membership</span>
          </Link>

          <button
            type="button"
            onClick={refresh}
            title="Refresh Leaderboard"
            className="inline-flex items-center justify-center p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards (Max 2 Content Rule: Top Label + Icon, Bottom Value) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Top Champion */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Top Champion</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 truncate" title={championName}>
            {championName}
          </span>
        </div>

        {/* Box 2: Peak Profit Earned */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peak Yield</span>
            <Trophy className="w-4 h-4 text-[#009F6B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
            ৳{championProfit.toLocaleString()}
          </span>
        </div>

        {/* Box 3: Podium Total Yield */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Podium Yield</span>
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
            ৳{totalPodiumYield.toLocaleString()}
          </span>
        </div>

        {/* Box 4: Total Ranked Leaders */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ranked Leaders</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
            {totalRankedCount > 0 ? totalRankedCount : 100} Active
          </span>
        </div>
      </div>

      {/* 3. Top 3 Podium Cards */}
      <LeaderboardPodium
        top1={top1}
        top2={top2}
        top3={top3}
        getPhotoUrl={getPhotoUrl}
      />

      {/* 4. Full Leaderboard Grid Container */}
      <LeaderboardGrid
        leaderboard={leaderboard}
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={hasMore}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        observerTarget={observerTarget}
        getPhotoUrl={getPhotoUrl}
      />
    </div>
  );
}
