'use client';

import React from 'react';
import { Loader2, ShieldCheck, Tv, CheckCircle2, AlertCircle } from 'lucide-react';

interface PremiumAdModalProps {
  isOpen: boolean;
  adCountdown: number;    // kept for API compat, not used with Monetag
  adCompleted: boolean;
  recordingAd: boolean;
  onFinishAd: () => void;
}

/**
 * This modal displays while Monetag's Rewarded Interstitial is active.
 *
 * With Monetag S2S:
 * - The actual ad is shown by Monetag's own full-screen overlay (they control it).
 * - This modal acts as a status indicator / waiting screen behind that overlay.
 * - adPlaying=true  → Monetag SDK is running (their overlay is on top of this)
 * - adCompleted=true → Monetag overlay closed; S2S postback is being verified (~2s)
 * - recordingAd=true → S2S verification in progress
 */
export function PremiumAdModal({
  isOpen,
  adCompleted,
  recordingAd,
  onFinishAd,
}: PremiumAdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[14px] max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-[#E5EBE7] space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E5EBE7] pb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#009F6B] flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sponsored Partner Ad</h3>
            <p className="text-[11px] text-slate-500 font-normal">
              {adCompleted
                ? 'Verifying your ad view securely...'
                : 'Monetag ad is loading. Please stay on this page.'}
            </p>
          </div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {recordingAd ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#009F6B] animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900">Verifying Ad View</p>
                <p className="text-xs text-slate-500 max-w-[220px] text-center">
                  Confirming with Monetag servers. Your reward will be credited in a moment.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Server-to-Server Verified</span>
              </div>
            </>
          ) : adCompleted ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#009F6B]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900">Ad Completed!</p>
                <p className="text-xs text-slate-500">Processing your reward now...</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900">Loading Ad...</p>
                <p className="text-xs text-slate-500 max-w-[220px] text-center">
                  Monetag is loading your sponsored ad. Please do not close this window.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Do not switch tabs — reward may not credit</span>
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-slate-400 text-center border-t border-[#E5EBE7] pt-3">
          Powered by Monetag S2S Verification · Fully Fraud-Protected
        </p>
      </div>
    </div>
  );
}
