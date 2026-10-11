'use client';

import React from 'react';
import { Crown, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '../../types';
import { NumericAmount } from '../design-system/NumericAmount';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-end pt-3">
      {/* 2nd Place (Silver) */}
      {top2 && (
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center space-y-4 relative order-2 md:order-1 hover:-translate-y-1 transition-all duration-300">
          {/* Subtle Silver Glow */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Rank Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 px-3.5 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider flex items-center space-x-1">
            <Medal className="w-3.5 h-3.5 text-slate-300" />
            <span>#2 Silver</span>
          </div>

          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white ring-4 ring-slate-300/80 ring-offset-2 ring-offset-white shadow-lg mt-2">
            <img src={getPhotoUrl(top2.photo_url)} alt={top2.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base truncate ">{top2.name}</h3>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200 inline-block truncate">
              {top2.badge || 'Silver Leader'}
            </span>
          </div>

          {/* Stats Box - Max 2 metric rows */}
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/95 space-y-1.5 shadow-2xs text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Invested:</span>
              <NumericAmount value={Number(top2.invested_amount)} variant="neutral" size="xs" />
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-1.5">
              <span className="text-slate-600 font-bold">Total Profit:</span>
              <NumericAmount value={Number(top2.profit_earned)} variant="gain" size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* 1st Place Champion (Gold) */}
      {top1 && (
        <div className="bg-white/80 backdrop-blur-xl border-2 border-amber-400/80 shadow-[0_12px_40px_rgba(245,158,11,0.12)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-center space-y-4 relative order-1 md:order-2 md:-translate-y-3 hover:-translate-y-4 transition-all duration-300">
          {/* Subtle gold mesh orb accent */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Champion Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center space-x-1.5 border border-amber-300 tracking-wider">
            <Crown className="w-4 h-4 text-amber-200 fill-amber-200 shrink-0" />
            <span>#1 Champion</span>
          </div>

          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white ring-4 ring-amber-400 ring-offset-4 ring-offset-white shadow-xl mt-2">
            <img src={getPhotoUrl(top1.photo_url)} alt={top1.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg truncate ">{top1.name}</h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 inline-block truncate shadow-2xs">
              {top1.badge || 'VIP Diamond Champion'}
            </span>
          </div>

          {/* Stats Box - Max 2 metric rows */}
          <div className="bg-amber-50/70 backdrop-blur-md p-4 rounded-2xl border border-amber-200/60 space-y-2 shadow-xs text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-900/80 font-medium">Invested:</span>
              <NumericAmount value={Number(top1.invested_amount)} variant="neutral" size="xs" />
            </div>
            <div className="flex justify-between items-center text-sm border-t border-amber-200/50 pt-2">
              <span className="text-amber-950 font-bold">Total Profit:</span>
              <NumericAmount value={Number(top1.profit_earned)} variant="gain" size="md" />
            </div>
          </div>
        </div>
      )}

      {/* 3rd Place (Bronze) */}
      {top3 && (
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center space-y-4 relative order-3 hover:-translate-y-1 transition-all duration-300">
          {/* Subtle Bronze Glow */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Rank Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-50 px-3.5 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider flex items-center space-x-1">
            <Medal className="w-3.5 h-3.5 text-amber-300" />
            <span>#3 Bronze</span>
          </div>

          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white ring-4 ring-amber-600/60 ring-offset-2 ring-offset-white shadow-lg mt-2">
            <img src={getPhotoUrl(top3.photo_url)} alt={top3.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base truncate ">{top3.name}</h3>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 inline-block truncate">
              {top3.badge || 'Bronze Leader'}
            </span>
          </div>

          {/* Stats Box - Max 2 metric rows */}
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/95 space-y-1.5 shadow-2xs text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Invested:</span>
              <NumericAmount value={Number(top3.invested_amount)} variant="neutral" size="xs" />
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-1.5">
              <span className="text-slate-600 font-bold">Total Profit:</span>
              <NumericAmount value={Number(top3.profit_earned)} variant="gain" size="sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
