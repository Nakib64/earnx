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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[14px] max-w-lg w-full p-6 text-slate-900 shadow-xl border border-[#E5EBE7] space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5EBE7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#009F6B] flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sponsored Partner Ad</h3>
              <p className="text-[11px] text-slate-500 font-normal">Please watch until countdown finishes</p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-[6px] bg-slate-100 border border-slate-200 text-xs  font-bold text-slate-700">
            {adCountdown > 0 ? `${adCountdown}s remaining` : 'Completed'}
          </div>
        </div>

        {/* Video / Ad Canvas Simulator */}
        <div className="relative aspect-video rounded-[10px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-inner">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#009F6B]">
            <Tv className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-white">EarnX Premier Partner Sponsor</h4>
          <p className="text-xs text-slate-400 max-w-xs">
            Earn daily rewards by actively watching verified digital partner promotions.
          </p>

          {/* Progress bar inside video */}
          <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-[#009F6B] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((8 - adCountdown) / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-500">
            {adCompleted
              ? 'Ad view verified. Click complete to credit.'
              : 'Please do not close this window.'}
          </span>
          <button
            type="button"
            onClick={onFinishAd}
            disabled={!adCompleted || recordingAd}
            className="px-5 py-2.5 rounded-[10px] bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {recordingAd ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Crediting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete &amp; Next</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
