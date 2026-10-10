'use client';

import React from 'react';
import { Medal, Search, Loader2, Sparkles, Award, X } from 'lucide-react';
import { LeaderboardEntry } from '../../types';
import { NumericAmount } from '../design-system/NumericAmount';

interface LeaderboardGridProps {
  leaderboard: LeaderboardEntry[];
  loadingInitial: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  getPhotoUrl: (url?: string | null) => string;
}

export function LeaderboardGrid({
  leaderboard,
  loadingInitial,
  loadingMore,
  hasMore,
  searchQuery,
  setSearchQuery,
  observerTarget,
  getPhotoUrl,
}: LeaderboardGridProps) {
  return (
    <div className="space-y-4">
      {/* Header & Search Bar inside Liquid Glass Card */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 truncate">
          <Medal className="w-5 h-5 text-[#009F6B] shrink-0" />
          <span className="truncate">Top Investor Directory</span>
        </h2>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search investor by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white/90 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 focus:border-[#009F6B] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Initial Loading Skeleton */}
      {loadingInitial ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="h-32 bg-white/60 border border-white/80 rounded-2xl sm:rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No matching leaders found</p>
          <p className="text-xs text-slate-400">Try adjusting your search keyword.</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {leaderboard.map((item) => (
            <div
              key={item.id}
              className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 hover:bg-white/90 hover:-translate-y-1 transition-all duration-200 min-w-0"
            >
              {/* Top Row: Rank & Avatar & Name */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={getPhotoUrl(item.photo_url)}
                    alt={item.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white ring-2 ring-slate-100 shadow-xs"
                  />
                  <span className="absolute -top-1.5 -left-1.5 bg-[#009F6B] text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-lg shadow-xs">
                    #{item.rank}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.name}
                  </h4>
                  {item.phone && (
                    <p className="text-[10px] text-slate-400 truncate">{item.phone}</p>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 mt-1 truncate max-w-[140px]">
                    <Award className="w-2.5 h-2.5 mr-0.5 shrink-0 text-amber-600" />
                    <span className="truncate">{item.badge || 'Investor'}</span>
                  </span>
                </div>
              </div>

              {/* Bottom Row: Invested vs Profit Stats (Max 2 Metrics) */}
              <div className="bg-white/80 backdrop-blur-md border border-white/95 rounded-2xl p-2.5 flex items-center justify-between text-xs min-w-0 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                    Invested
                  </span>
                  <NumericAmount value={Number(item.invested_amount)} variant="neutral" size="xs" />
                </div>

                <div className="text-right min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                    Profit
                  </span>
                  <NumericAmount value={Number(item.profit_earned)} variant="gain" size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger Target Element */}
      <div ref={observerTarget as any} className="py-4 text-center">
        {loadingMore && (
          <div className="flex items-center justify-center space-x-2 text-[#009F6B] font-bold text-xs">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Loading more leaders...</span>
          </div>
        )}

        {!hasMore && leaderboard.length > 0 && (
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>You&apos;ve reached the end of the leaderboard ({leaderboard.length} Leaders)</span>
          </p>
        )}
      </div>
    </div>
  );
}
