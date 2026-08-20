'use client';

import React from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUsersBannerProps {
  totalMembers: number;
  onRefresh: () => void;
}

export function AdminUsersBanner({ totalMembers, onRefresh }: AdminUsersBannerProps) {
  const handleRefresh = () => {
    onRefresh();
    toast.info('Refreshed user network data');
  };

  return (
    <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3">
      <div className="flex items-start space-x-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-md">
          <Users className="w-6 h-6 text-[#f3ba2f]" />
        </div>
        <div className="space-y-1 flex-1">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Badged Leaders & Referral Network
          </h1>
          <p className="text-xs text-slate-300 font-semibold">
            Explore referral tree networks, assign leader badges, adjust balances, and manage account statuses.
          </p>
        </div>
        <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-[#03442e] text-amber-200 border border-[#d4af37]/40 font-mono shrink-0 hidden sm:inline-flex">
          {totalMembers} Members
        </span>
      </div>

      {/* Action Controls */}
      <div className="border-t border-[#053d29] pt-3 flex items-center justify-between">
        <button
          onClick={handleRefresh}
          className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Network Data</span>
        </button>
      </div>
    </div>
  );
}
