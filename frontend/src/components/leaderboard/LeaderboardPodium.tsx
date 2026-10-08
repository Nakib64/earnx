'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardPodiumProps {
  top1?: LeaderboardEntry;
  top2?: LeaderboardEntry;
  top3?: LeaderboardEntry;
  getPhotoUrl: (url?: string | null) => string;
}

export function LeaderboardPodium({
  top1,
  top2,
  top3,
  getPhotoUrl,
}: LeaderboardPodiumProps) {
  if (!top1 && !top2 && !top3) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
      {/* 2nd Place */}
      {top2 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4 relative order-2 md:order-1">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 px-3.5 py-0.5 rounded-full text-xs font-black shadow-sm">
            2ND PLACE
          </div>
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-300 shadow-md">
            <img src={getPhotoUrl(top2.photo_url)} alt={top2.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 text-base truncate">{top2.name}</h3>
            <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 inline-block truncate">
              {top2.badge || 'Silver Investor'}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-0.5 font-mono">
            <p className="text-[11px] text-slate-500 font-semibold">Invested: ৳{Number(top2.invested_amount).toLocaleString()}</p>
            <p className="text-sm font-black text-[#01281a]">Profit: ৳{Number(top2.profit_earned).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* 1st Place Champion */}
      {top1 && (
        <div className="bg-gradient-to-br from-[#2a1a03] via-[#1c1102] to-[#140b01] rounded-3xl p-6 border-2 border-amber-400 shadow-xl text-center space-y-4 text-white relative order-1 md:order-2 md:-translate-y-3">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#01281a] text-[#f3ba2f] px-4 py-1 rounded-full text-xs font-black shadow-md flex items-center space-x-1 border border-[#d4af37]/50">
            <Crown className="w-4 h-4 text-[#f3ba2f] fill-[#f3ba2f] shrink-0" />
            <span>#1 CHAMPION</span>
          </div>
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-amber-400 shadow-lg">
            <img src={getPhotoUrl(top1.photo_url)} alt={top1.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-white text-lg truncate">{top1.name}</h3>
            <span className="text-xs font-black text-amber-200 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/40 inline-block truncate">
              {top1.badge || 'VIP Diamond Leader'}
            </span>
          </div>
          <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30 space-y-0.5 font-mono">
            <p className="text-[11px] text-amber-200 font-semibold">Invested: ৳{Number(top1.invested_amount).toLocaleString()}</p>
            <p className="text-base font-black text-[#f3ba2f]">Total Profit: ৳{Number(top1.profit_earned).toLocaleString()}</p>
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
            <p className="text-sm font-black text-[#005A36]">Profit: ৳{Number(top3.profit_earned).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
