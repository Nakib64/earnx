'use client';

import React from 'react';
import { Tv, CheckCircle2, PlayCircle, Wallet, Zap, ShieldCheck } from 'lucide-react';

interface DailyTaskInfo {
  is_premium: boolean;
  package_title?: string;
  daily_reward_amount?: number;
  ads_watched?: number;
  daily_ads_required?: number;
  reward_per_ad?: number;
  earned_today?: number;
  remaining_ads?: number;
  remaining_reward?: number;
  quota_reached?: boolean;
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
  // If user is not premium, do not show the redundant large banner (per design specification)
  if (!dailyTask?.is_premium) {
    return null;
  }

  const adsWatched = dailyTask?.ads_watched || 0;
  const adsRequired = dailyTask?.daily_ads_required || 30;
  const rewardPerAd =
    dailyTask?.reward_per_ad ??
    Number(((dailyTask?.daily_reward_amount || 0) / (adsRequired || 1)).toFixed(2));
  const earnedToday = dailyTask?.earned_today ?? Number((adsWatched * rewardPerAd).toFixed(2));
  const quotaReached = adsWatched >= adsRequired;
  const progressPercent = Math.min(100, Math.round((adsWatched / (adsRequired || 1)) * 100));

  return (
    <div className="bg-white border border-[#E5EBE7] rounded-[14px] p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EBE7] pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900 ">Today&apos;s Watch & Earn Tasks</h2>
              <span className="px-2.5 py-0.5 rounded-[6px] bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/80">
                {dailyTask.package_title}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Daily Reward Pool:{' '}
              <strong className="text-slate-900 font-semibold ">৳{dailyTask.daily_reward_amount}</strong>
              <span className="mx-2 text-slate-300">•</span>
              Rate:{' '}
              <strong className="text-slate-900 font-semibold ">৳{rewardPerAd.toFixed(2)} / ad</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {quotaReached ? (
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#009F6B] shrink-0" />
              <span>All {adsRequired} Ads Watched! (৳{earnedToday.toFixed(2)} Credited)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartWatchAd}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>
                Watch Ad #{adsWatched + 1} (+৳{rewardPerAd.toFixed(2)})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Fractional Earning Highlight Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Earned Today
            </span>
            <div className="flex items-baseline gap-1 ">
              <span className="text-lg font-bold text-slate-900">৳{earnedToday.toFixed(2)}</span>
              <span className="text-xs text-slate-400">/ ৳{dailyTask.daily_reward_amount}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Reward Per Ad
            </span>
            <span className="text-lg font-bold text-slate-900 ">৳{rewardPerAd.toFixed(2)}</span>
            <span className="text-[10px] font-normal text-slate-500 block">Instant Wallet Credit</span>
          </div>
        </div>

        <div className="p-4 rounded-[12px] bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#009F6B] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Fractional Payout Active
            </span>
            <p className="text-[11px] font-medium text-emerald-900 leading-tight">
              Each ad watched immediately credits your wallet. No full quota wait required.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Counters */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-700">
            Progress: <span className="text-slate-900  font-bold">{adsWatched}</span> of {adsRequired} ads completed
          </span>
          <span className="text-slate-500 ">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
          <div
            className="bg-[#009F6B] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Visual Ad Slots Grid */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium text-slate-500">
          <span>Daily Ads Matrix ({adsRequired} Total Slots)</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Green = Credited | Dark = Next | Gray = Pending</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {Array.from({ length: adsRequired }).map((_, idx) => {
            const isWatched = idx < adsWatched;
            const isNext = idx === adsWatched;
            return (
              <div
                key={idx}
                className={`p-2 rounded-[8px] border text-center transition-all ${isWatched
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                  : isNext
                    ? 'border-[#009F6B] bg-white text-[#009F6B] ring-1 ring-[#009F6B]/30'
                    : 'border-slate-200/70 bg-slate-50/60 text-slate-400'
                  }`}
                title={`Ad #${idx + 1}: ${isWatched ? 'Completed & Credited' : isNext ? 'Ready to watch' : 'Pending'}`}
              >
                <div className="flex justify-center mb-0.5">
                  {isWatched ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#009F6B]" />
                  ) : (
                    <Tv className={`w-3.5 h-3.5 ${isNext ? 'text-[#009F6B]' : 'text-slate-300'}`} />
                  )}
                </div>
                <span className="text-[10px] font-bold block ">#{idx + 1}</span>
                <span className="text-[9px] font-medium block truncate tabular-nums">
                  {isWatched ? `+৳${rewardPerAd.toFixed(0)}` : isNext ? 'Next' : '৳' + rewardPerAd.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
