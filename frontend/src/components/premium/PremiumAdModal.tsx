'use client';

import React from 'react';
import { PlayCircle, Tv, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PremiumAdModalProps {
  isOpen: boolean;
  adCountdown: number;
  adCompleted: boolean;
  recordingAd: boolean;
  onFinishAd: () => void;
}

export function PremiumAdModal({
  isOpen,
  adCountdown,
  adCompleted,
  recordingAd,
  onFinishAd,
}: PremiumAdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Sponsored Partner Ad</h3>
              <p className="text-[11px] text-slate-400 font-medium">Watch until the countdown finishes</p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-black text-amber-400">
            {adCountdown > 0 ? `${adCountdown}s remaining` : 'Finished!'}
          </div>
        </div>

        {/* Video / Ad Canvas Simulator */}
        <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Tv className="w-8 h-8 animate-pulse" />
          </div>
          <h4 className="text-base font-black text-white">EarnX Premier Partner Sponsor</h4>
          <p className="text-xs text-slate-400 max-w-xs">
            Earn daily rewards by actively watching verified digital partner promotions.
          </p>

          {/* Progress bar inside video */}
          <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((8 - adCountdown) / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400">
            {adCompleted
              ? 'Ad view verified! Click complete to register.'
              : 'Please do not close this window.'}
          </span>
          <button
            type="button"
            onClick={onFinishAd}
            disabled={!adCompleted || recordingAd}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {recordingAd ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete & Next</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
