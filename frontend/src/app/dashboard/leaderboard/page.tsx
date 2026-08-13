'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { LeaderboardEntry } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';
import { Trophy, Crown, Medal, Search, Loader2, Sparkles, TrendingUp, Award } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface PaginatedResponse {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export default function UserLeaderboardPage() {
  const [top3Entries, setTop3Entries] = useState<LeaderboardEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Fetch Top 3 Leaders once on load
  const fetchTop3 = useCallback(async () => {
    const res = await apiFetch<LeaderboardEntry[]>('/leaderboard');
    if (res.success && res.data) {
      setTop3Entries(res.data.slice(0, 3));
    }
  }, []);

  // Fetch paginated leaderboard entries
  const fetchPage = useCallback(
    async (pageNum: number, search: string, append = false) => {
      if (pageNum === 1) setLoadingInitial(true);
      else setLoadingMore(true);

      const res = await apiFetch<PaginatedResponse>(
        `/leaderboard?page=${pageNum}&limit=20&search=${encodeURIComponent(search)}`,
      );

      if (res.success && res.data) {
        const newEntries = res.data.data;
        setLeaderboard((prev) => (append ? [...prev, ...newEntries] : newEntries));
        setHasMore(res.data.hasMore);
        setPage(res.data.page);
      } else if (res.success && Array.isArray(res.data)) {
        const raw = res.data as unknown as LeaderboardEntry[];
        setLeaderboard(raw);
        setHasMore(false);
      }

      setLoadingInitial(false);
      setLoadingMore(false);
    },
    [],
  );

  useEffect(() => {
    fetchTop3();
  }, [fetchTop3]);

  // When search changes, reset page to 1
  useEffect(() => {
    fetchPage(1, debouncedSearch, false);
  }, [debouncedSearch, fetchPage]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loadingMore || loadingInitial) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPage(page + 1, debouncedSearch, true);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loadingMore, loadingInitial, page, debouncedSearch, fetchPage]);

  const getPhotoUrl = (url?: string | null) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=user`;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const top1 = top3Entries.find((item) => item.rank === 1);
  const top2 = top3Entries.find((item) => item.rank === 2);
  const top3 = top3Entries.find((item) => item.rank === 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">


      {/* Top 3 Podium Cards */}
      {(top1 || top2 || top3) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
          {/* 2nd Place */}
          {top2 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-center space-y-4 relative order-2 md:order-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-3.5 py-0.5 rounded-full text-xs font-black shadow-sm">
                2ND PLACE
              </div>
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-300 shadow-md">
                <img src={getPhotoUrl(top2.photo_url)} alt={top2.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base truncate">{top2.name}</h3>
                <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 inline-block truncate">
                  {top2.badge || 'Silver Investor'}
                </span>
              </div>
              <div className="bg-[#F2FBF6] p-3 rounded-2xl border border-emerald-100/90 space-y-0.5 font-mono">
                <p className="text-[11px] text-slate-500 font-medium">Invested: ৳{Number(top2.invested_amount).toLocaleString()}</p>
                <p className="text-sm font-black text-primary">Profit: ৳{Number(top2.profit_earned).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {top1 && (
            <div className="bg-[#FFF8F3] rounded-3xl p-6 border-2 border-amber-300 shadow-md text-center space-y-4 relative order-1 md:order-2 md:-translate-y-3">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#005A36] text-secondary px-4 py-1 rounded-full text-xs font-black shadow-sm flex items-center space-x-1 border border-secondary/40">
                <Crown className="w-4 h-4 text-secondary fill-secondary shrink-0" />
                <span>#1 CHAMPION</span>
              </div>
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-amber-400 shadow-lg">
                <img src={getPhotoUrl(top1.photo_url)} alt={top1.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-lg truncate">{top1.name}</h3>
                <span className="text-xs font-extrabold text-[#854D0E] bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300 inline-block truncate">
                  {top1.badge || 'VIP Diamond Leader'}
                </span>
              </div>
              <div className="bg-amber-100/60 p-3.5 rounded-2xl border border-amber-200/90 space-y-0.5 font-mono">
                <p className="text-[11px] text-[#854D0E] font-medium">Invested: ৳{Number(top1.invested_amount).toLocaleString()}</p>
                <p className="text-base font-black text-[#005A36]">Total Profit: ৳{Number(top1.profit_earned).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-center space-y-4 relative order-3">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#854D0E] text-white px-3.5 py-0.5 rounded-full text-xs font-black shadow-sm">
                3RD PLACE
              </div>
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-600/40 shadow-md">
                <img src={getPhotoUrl(top3.photo_url)} alt={top3.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base truncate">{top3.name}</h3>
                <span className="text-[10px] font-extrabold text-[#854D0E] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 inline-block truncate">
                  {top3.badge || 'Bronze Member'}
                </span>
              </div>
              <div className="bg-[#F2FBF6] p-3 rounded-2xl border border-emerald-100/90 space-y-0.5 font-mono">
                <p className="text-[11px] text-slate-500 font-medium">Invested: ৳{Number(top3.invested_amount).toLocaleString()}</p>
                <p className="text-sm font-black text-primary">Profit: ৳{Number(top3.profit_earned).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leader Cards Grid Container */}
      <div className="space-y-4">
        {/* Header & Search Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2 truncate">
            <Medal className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">All Leaderboard Members</span>
          </h2>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search investor by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Initial Loading Skeleton */}
        {loadingInitial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-32 bg-slate-100 animate-pulse rounded-3xl"></div>
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
                    <span className="absolute -top-1.5 -left-1.5 bg-[#005A36] text-secondary font-mono font-black text-[9px] px-1.5 py-0.5 rounded-lg shadow-xs">
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
                    <span className="font-black text-primary truncate block">
                      +৳{Number(item.profit_earned).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger Target Element */}
        <div ref={observerTarget} className="py-4 text-center">
          {loadingMore && (
            <div className="flex items-center justify-center space-x-2 text-primary font-extrabold text-xs">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />
              <span>Loading more leaders...</span>
            </div>
          )}

          {!hasMore && leaderboard.length > 0 && (
            <p className="text-xs text-slate-400 font-semibold flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>You've reached the end of the leaderboard ({leaderboard.length} Leaders)</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
