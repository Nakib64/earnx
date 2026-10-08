'use client';

import React from 'react';
import { Tv, CheckCircle2, Gift, PlayCircle, RefreshCw } from 'lucide-react';
import { PremiumPackage } from '../../types';

interface DailyTaskInfo {
  is_premium: boolean;
  package_title?: string;
  daily_reward_amount?: number;
  ads_watched?: number;
  daily_ads_required?: number;
  can_claim?: boolean;
  is_claimed?: boolean;
}

interface PremiumDailyTaskCardProps {
  dailyTask: DailyTaskInfo | null;
  claiming: boolean;
  onClaim: () => void;
  onStartWatchAd: () => void;
}

export function PremiumDailyTaskCard({
  dailyTask,
  claiming,
  onClaim,
  onStartWatchAd,
}: PremiumDailyTaskCardProps) {
  if (!dailyTask?.is_premium) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase">
            Free Account Status
          </span>
          <h2 className="text-xl font-black text-slate-900">
            Unlock Daily Ads & Earn Daily BDT
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-lg">
            Upgrade to any Premium Package below to unlock daily video ads, coin transfer features, and investment opportunities.
          </p>
        </div>
        <a
          href="#packages"
          className="px-6 py-3 bg-[#005A36] hover:bg-[#044D2F] text-white rounded-2xl font-black text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          Choose a VIP Package
        </a>
      </div>
    );
  }

  const adsWatched = dailyTask?.ads_watched || 0;
  const adsRequired = dailyTask?.daily_ads_required || 6;
  const progressPercent = Math.min(100, Math.round((adsWatched / (adsRequired || 1)) * 100));

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">Today&apos;s Watch & Earn Tasks</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                {dailyTask.package_title}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Daily Reward Pool: <strong className="text-emerald-700 font-black">৳{dailyTask.daily_reward_amount}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dailyTask.is_claimed ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Claimed for Today!</span>
            </div>
          ) : dailyTask.can_claim ? (
            <button
              onClick={onClaim}
              disabled={claiming}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {claiming ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 text-emerald-200" />
              )}
              <span>Claim ৳{dailyTask.daily_reward_amount} Reward</span>
            </button>
          ) : (
            <button
              onClick={onStartWatchAd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-black text-xs shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-emerald-300" />
              <span>Watch Next Ad ({adsWatched + 1}/{adsRequired})</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Counters */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-black">
          <span className="text-slate-700">
            Ads Watched: <strong className="text-[#005A36]">{adsWatched}</strong> of {adsRequired}
          </span>
          <span className="text-slate-500">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-600 to-[#005A36] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Ad Slot Cards visual indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Array.from({ length: adsRequired }).map((_, idx) => {
          const isWatched = idx < adsWatched;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                isWatched
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                  : idx === adsWatched
                  ? 'border-[#005A36] bg-emerald-50/20 text-[#005A36] ring-1 ring-[#005A36]'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="flex justify-center mb-1">
                {isWatched ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Tv className="w-5 h-5" />
                )}
              </div>
              <span className="text-[11px] font-black">Ad #{idx + 1}</span>
              <p className="text-[10px] font-bold mt-0.5">
                {isWatched ? 'Completed' : idx === adsWatched ? 'Next' : 'Locked'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
