'use client';

import React from 'react';
import {
  CheckCircle2,
  PlayCircle,
  Wallet,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

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
  if (!dailyTask?.is_premium) {
    return null;
  }

  const adsWatched = dailyTask?.ads_watched || 0;
  const adsRequired = dailyTask?.daily_ads_required || 30;
  const rewardPerAd =
    dailyTask?.reward_per_ad ??
    Number(((dailyTask?.daily_reward_amount || 0) / (adsRequired || 1)).toFixed(2));
  const earnedToday = dailyTask?.earned_today ?? Number((adsWatched * rewardPerAd).toFixed(2));
  const remainingAds = Math.max(0, adsRequired - adsWatched);
  const remainingReward = Math.max(
    0,
    Number(((dailyTask?.daily_reward_amount || 0) - earnedToday).toFixed(2)),
  );
  const quotaReached = adsWatched >= adsRequired;
  const progressPercent = Math.min(100, Math.round((adsWatched / (adsRequired || 1)) * 100));

  return (
    <div className="relative rounded-[28px] sm:rounded-[32px] border border-white/90 bg-white/80 backdrop-blur-xl shadow-[14px_14px_35px_rgba(15,23,42,0.06),-10px_-10px_30px_rgba(255,255,255,0.95),inset_0_1px_1px_rgba(255,255,255,1)] p-6 sm:p-8 space-y-6 font-[family-name:var(--font-montserrat)] overflow-hidden">

      {/* Subtle ambient light refractions behind glass */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-slate-200/30 blur-3xl" />

      {/* ── CONTINUOUS LIQUID WATER FLOW KEYFRAMES ── */}
      <style>{`
        @keyframes waterFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes liquidDiagonal {
          0% { background-position: 0 0; }
          100% { background-position: 48px 0; }
        }
        @keyframes waterWaveSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── HEADER & CTA SECTION ── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-white/80 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {dailyTask.package_title ? `${dailyTask.package_title} • Daily Ads` : 'Daily Ads Allowance'}
          </div>
          <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
            Watch Ads &amp; Earn Cash
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Daily Reward Pool: <strong className="text-slate-900 font-bold">৳{dailyTask.daily_reward_amount}</strong>
            <span className="mx-2 text-slate-300">•</span>
            Rate: <strong className="text-[#009F6B] font-bold">৳{rewardPerAd.toFixed(2)}</strong> per ad
          </p>
        </div>

        {/* Action Button / Quota Status */}
        <div className="shrink-0">
          {quotaReached ? (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/80 text-emerald-800 font-bold text-xs shadow-[2px_2px_8px_rgba(0,159,107,0.08),-2px_-2px_8px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,1)]">
              <CheckCircle2 className="w-4 h-4 text-[#009F6B] shrink-0" />
              <span>All {adsRequired} Ads Completed Today</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartWatchAd}
              className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white font-bold text-sm shadow-[5px_5px_15px_rgba(0,159,107,0.32),-3px_-3px_12px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:shadow-[7px_7px_20px_rgba(0,159,107,0.4),-4px_-4px_14px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_5px_rgba(0,70,45,0.4)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-white" />
              <span>Watch Ad #{adsWatched + 1} (+৳{rewardPerAd.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
      <div className="relative z-10 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">
            Progress: <span className="text-slate-900 font-bold">{adsWatched}</span> of {adsRequired} ads completed
          </span>
          <span className="text-[#009F6B] font-bold text-sm">{progressPercent}%</span>
        </div>

        {/* Neumorphic Recessed Glass Water Tube */}
        <div className="w-full bg-slate-100/90 rounded-full h-5 sm:h-6 p-1 border border-white/80 shadow-[inset_3px_3px_6px_rgba(15,23,42,0.07),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] relative overflow-hidden backdrop-blur-sm">
          {progressPercent > 0 && (
            <div
              className="h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out shadow-xs"
              style={{
                width: `${Math.max(2, progressPercent)}%`,
                background:
                  'linear-gradient(90deg, #007A53 0%, #009F6B 25%, #05DF96 50%, #00C887 75%, #007A53 100%)',
                backgroundSize: '200% 100%',
                animation: 'waterFlow 2.8s ease infinite',
              }}
            >
              {/* Continuous Liquid Diagonal Stream Currents */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 10px, transparent 10px, transparent 20px)',
                  animation: 'liquidDiagonal 1.4s linear infinite',
                }}
              />

              {/* Continuous Liquid Wave Crest (SVG wave sliding horizontally) */}
              <div
                className="absolute inset-0 flex items-center pointer-events-none opacity-45"
                style={{
                  width: '200%',
                  animation: 'waterWaveSlide 2s linear infinite',
                }}
              >
                <svg
                  className="w-full h-full text-white/40 fill-current"
                  viewBox="0 0 1200 40"
                  preserveAspectRatio="none"
                >
                  <path d="M0,20 C150,35 350,5 500,20 C650,35 850,5 1000,20 C1150,35 1350,5 1500,20 L1500,40 L0,40 Z" />
                </svg>
              </div>

              {/* Top Glass Surface Reflection */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 via-white/10 to-transparent rounded-t-full pointer-events-none" />

              {/* Leading Water Droplet Crest */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            </div>
          )}
        </div>
      </div>
      {/* ── 3 CLEAN UNIFIED METRIC TILES (GLASS + NEUMORPHIC ELEVATED PADS) ── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tile 1: Earned Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-[6px_6px_16px_rgba(15,23,42,0.04),-6px_-6px_16px_rgba(255,255,255,0.95),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_rgba(15,23,42,0.06),-8px_-8px_20px_rgba(255,255,255,1)] transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Earned Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/90 shadow-[2px_2px_6px_rgba(15,23,42,0.04),-2px_-2px_6px_rgba(255,255,255,0.95)] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#009F6B]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ৳{earnedToday.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / ৳{dailyTask.daily_reward_amount}
            </span>
          </div>
        </div>

        {/* Tile 2: Payout Rate Per Ad */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-[6px_6px_16px_rgba(15,23,42,0.04),-6px_-6px_16px_rgba(255,255,255,0.95),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_rgba(15,23,42,0.06),-8px_-8px_20px_rgba(255,255,255,1)] transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Reward Per Ad
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/90 shadow-[2px_2px_6px_rgba(15,23,42,0.04),-2px_-2px_6px_rgba(255,255,255,0.95)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#009F6B]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#009F6B]">
              ৳{rewardPerAd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              per view
            </span>
          </div>
        </div>

        {/* Tile 3: Remaining Potential */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-[6px_6px_16px_rgba(15,23,42,0.04),-6px_-6px_16px_rgba(255,255,255,0.95),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_rgba(15,23,42,0.06),-8px_-8px_20px_rgba(255,255,255,1)] transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Remaining
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/90 shadow-[2px_2px_6px_rgba(15,23,42,0.04),-2px_-2px_6px_rgba(255,255,255,0.95)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ৳{remainingReward.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({remainingAds} ads left)
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTINUOUS LIQUID WATER PROGRESS BAR ── */}


    </div>
  );
}
