'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { LeaderboardEntry } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { Trophy, Crown, Medal, Search } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

import { useDebounce } from '../../../hooks/useDebounce';

export default function UserLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const res = await apiFetch<LeaderboardEntry[]>('/leaderboard');
    if (res.success && res.data) {
      setLeaderboard(res.data);
    }
    setLoading(false);
  };

  const getPhotoUrl = (url?: string | null) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=user`;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const top1 = leaderboard.find((item) => item.rank === 1);
  const top2 = leaderboard.find((item) => item.rank === 2);
  const top3 = leaderboard.find((item) => item.rank === 3);

  const filteredEntries = leaderboard
    .filter((item) => item.rank > 3)
    .filter((item) => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const leaderboardColumns: ColumnDef<LeaderboardEntry>[] = [
    {
      key: 'rank_investor',
      header: 'Rank & Investor',
      render: (item) => (
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-none bg-slate-100 border border-slate-200 inline-flex items-center justify-center text-[10px] font-extrabold text-slate-800 shrink-0 font-mono">
            #{item.rank}
          </span>
          <img
            src={getPhotoUrl(item.photo_url)}
            alt={item.name}
            className="w-8 h-8 rounded-none object-cover border border-slate-200 shrink-0"
          />
          <div>
            <p className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-[180px]">{item.name}</p>
            {item.phone && <p className="text-[9px] font-mono text-slate-400">{item.phone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'badge_invested',
      header: 'Badge & Invested',
      render: (item) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-none text-[8px] sm:text-[9px] font-extrabold bg-yellow-50 text-[#854D0E] border border-yellow-300">
            {item.badge || 'Top Investor'}
          </span>
          <div className="font-mono text-[10px] font-extrabold text-slate-900">
            ৳{Number(item.invested_amount).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'profit_earned',
      header: 'Profit Earned',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-extrabold text-[11px] text-primary">
          +৳{Number(item.profit_earned).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-none bg-primary p-6 sm:p-8 text-white shadow-xs ">
        <div className="relative z-10 space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-none bg-black/20 text-secondary border border-secondary/40 text-xs font-extrabold">
            <Trophy className="w-4 h-4 text-secondary" />
            <span>Official Investor Hall of Fame</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Top 100 Investment Leaderboard</h1>
          <p className="text-emerald-100 text-sm max-w-2xl">
            Celebrating our top 100 high-yield investors. Rankings are based on total capital invested and profit dividends earned.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-none"></div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {(top1 || top2 || top3) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              {top2 && (
                <div className="bg-white rounded-none p-6 border-2 border-slate-200 shadow-xs text-center space-y-4 relative order-2 md:order-1">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-3 py-0.5 rounded-none text-xs font-black shadow-xs">
                    2ND PLACE
                  </div>
                  <div className="relative w-20 h-20 mx-auto rounded-none overflow-hidden border-2 border-slate-300 shadow-xs">
                    <img
                      src={getPhotoUrl(top2.photo_url)}
                      alt={top2.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{top2.name}</h3>
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-none border border-slate-200">
                      {top2.badge || 'Silver Investor'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-none border border-slate-200 space-y-1 font-mono">
                    <p className="text-xs text-slate-500">Invested: ৳{Number(top2.invested_amount).toLocaleString()}</p>
                    <p className="text-sm font-extrabold text-primary">
                      Profit: ৳{Number(top2.profit_earned).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {top1 && (
                <div className="bg-emerald-50/40 rounded-none p-6 border-2 border-secondary shadow-md text-center space-y-4 relative order-1 md:order-2 md:-translate-y-4">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-secondary border-b-2 border-secondary px-4 py-1 rounded-none text-xs font-black shadow-xs flex items-center space-x-1">
                    <Crown className="w-4 h-4 text-secondary fill-secondary" />
                    <span>#1 CHAMPION</span>
                  </div>
                  <div className="relative w-24 h-24 mx-auto rounded-none overflow-hidden border-4 border-secondary shadow-md">
                    <img
                      src={getPhotoUrl(top1.photo_url)}
                      alt={top1.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl">{top1.name}</h3>
                    <span className="text-xs font-extrabold text-[#854D0E] bg-yellow-50 px-3 py-1 rounded-none border border-yellow-300">
                      {top1.badge || 'VIP Diamond Leader'}
                    </span>
                  </div>
                  <div className="bg-yellow-50/80 p-3.5 rounded-none border border-yellow-300 space-y-1 font-mono">
                    <p className="text-xs text-[#854D0E] font-medium">Invested: ৳{Number(top1.invested_amount).toLocaleString()}</p>
                    <p className="text-base font-black text-primary">
                      Total Profit: ৳{Number(top1.profit_earned).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {top3 && (
                <div className="bg-white rounded-none p-6 border-2 border-slate-200 shadow-xs text-center space-y-4 relative order-3">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#854D0E] text-white px-3 py-0.5 rounded-none text-xs font-black shadow-xs">
                    3RD PLACE
                  </div>
                  <div className="relative w-20 h-20 mx-auto rounded-none overflow-hidden border-2 border-amber-600/40 shadow-xs">
                    <img
                      src={getPhotoUrl(top3.photo_url)}
                      alt={top3.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{top3.name}</h3>
                    <span className="text-xs font-extrabold text-[#854D0E] bg-yellow-50 px-2.5 py-0.5 rounded-none border border-yellow-300">
                      {top3.badge || 'Bronze Member'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-none border border-slate-200 space-y-1 font-mono">
                    <p className="text-xs text-slate-500">Invested: ৳{Number(top3.invested_amount).toLocaleString()}</p>
                    <p className="text-sm font-extrabold text-primary">
                      Profit: ৳{Number(top3.profit_earned).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ranks 4 to 100 List using DataTable */}
          <div className="bg-white rounded-none border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <Medal className="w-5 h-5 text-primary" />
                <span>Ranks 4 to 100 Leaderboard</span>
              </h2>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by investor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-none border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <DataTable<LeaderboardEntry>
              data={filteredEntries}
              columns={leaderboardColumns}
              keyExtractor={(item) => item.id}
              loading={loading}
              emptyMessage="No matching investors found on the leaderboard."
            />
          </div>
        </>
      )}
    </div>
  );
}
