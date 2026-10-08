'use client';

import React from 'react';
import { Medal, Search, Loader2, Sparkles, Award } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

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
      {/* Header & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2 truncate">
          <Medal className="w-5 h-5 text-[#005A36] shrink-0" />
          <span className="truncate">All Leaderboard Members</span>
        </h2>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search investor by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A36] transition-all"
          />
        </div>
      </div>

      {/* Initial Loading Skeleton */}
      {loadingInitial ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-32 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center text-slate-400 text-xs font-bold">
          No matching leaders found.
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaderboard.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 hover:border-emerald-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 hover:-translate-y-0.5 transition-all min-w-0"
            >
              {/* Top Row: Rank & Avatar & Name */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={getPhotoUrl(item.photo_url)}
                    alt={item.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <span className="absolute -top-1.5 -left-1.5 bg-[#005A36] text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded-lg shadow-xs">
                    #{item.rank}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                    {item.name}
                  </h4>
                  {item.phone && (
                    <p className="text-[10px] font-mono text-slate-400 truncate">{item.phone}</p>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-50 text-[#854D0E] border border-amber-200/80 mt-1 truncate max-w-[120px]">
                    <Award className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                    <span className="truncate">{item.badge || 'Investor'}</span>
                  </span>
                </div>
              </div>

              {/* Bottom Row: Invested vs Profit Stats */}
              <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-2.5 flex items-center justify-between text-xs font-mono min-w-0">
                <div className="min-w-0">
                  <span className="text-[9px] font-sans font-bold text-slate-400 block uppercase tracking-wider">
                    Invested
                  </span>
                  <span className="font-extrabold text-slate-900 truncate block">
                    ৳{Number(item.invested_amount).toLocaleString()}
                  </span>
                </div>

                <div className="text-right min-w-0">
                  <span className="text-[9px] font-sans font-bold text-slate-400 block uppercase tracking-wider">
                    Profit
                  </span>
                  <span className="font-black text-[#005A36] truncate block">
                    +৳{Number(item.profit_earned).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger Target Element */}
      <div ref={observerTarget as any} className="py-4 text-center">
        {loadingMore && (
          <div className="flex items-center justify-center space-x-2 text-[#005A36] font-extrabold text-xs">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#005A36]" />
            <span>Loading more leaders...</span>
          </div>
        )}

        {!hasMore && leaderboard.length > 0 && (
          <p className="text-xs text-slate-400 font-semibold flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>You&apos;ve reached the end of the leaderboard ({leaderboard.length} Leaders)</span>
          </p>
        )}
      </div>
    </div>
  );
}
