'use client';

import React from 'react';
import { UserInvestment } from '../../types';
import { Lock, Unlock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface InvestmentWithdrawModalProps {
  activeInv: UserInvestment;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function InvestmentWithdrawModal({
  activeInv,
  submitting,
  onClose,
  onConfirm,
}: InvestmentWithdrawModalProps) {
  const currentAmt = Number(activeInv.amount);
  const isLocked = Boolean(activeInv.ends_at && new Date() < new Date(activeInv.ends_at));
  const lockDateStr = activeInv.ends_at
    ? new Date(activeInv.ends_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-[family-name:var(--font-montserrat)]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {isLocked ? 'Capital Principal Locked' : 'Withdraw Invested Capital'}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {isLocked ? 'Package tenure is currently active' : '100% Capital refund to your cash wallet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 ml-2 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Capital Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Invested Capital
              </span>
              {isLocked ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>Matured</span>
                </span>
              )}
            </div>
            <p className="text-3xl font-bold tabular-nums text-white">
              ৳{currentAmt.toLocaleString()}
            </p>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              {isLocked
                ? `This principal capital is locked until the package tenure concludes on ${lockDateStr}.`
                : `Your package tenure has concluded. You can now refund 100% of your invested capital directly to your Cash Wallet.`}
            </p>
          </div>

          {/* Policy Information */}
          {isLocked ? (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Early Withdrawal Restriction:</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed font-normal">
                Per EarnX platform rules, invested principal cannot be withdrawn before the {activeInv.duration_months || 3}-month package tenure ends on <strong>{lockDateStr}</strong>.
              </p>
              <div className="pt-1 border-t border-amber-200/60 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                <span>⚡ Monthly interest (৳{Number(activeInv.monthly_payout_amount).toLocaleString()}/mo) continues to be deposited directly into your Cash Wallet.</span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-[#009F6B] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#009F6B]" />
                <span>Instant Wallet Credit:</span>
              </p>
              <p className="text-[11px] text-emerald-900 font-normal leading-relaxed">
                Refunding will immediately credit ৳{currentAmt.toLocaleString()} back to your main account balance and close this investment package.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-all cursor-pointer"
          >
            {isLocked ? 'Close' : 'Cancel'}
          </button>
          {!isLocked ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              {submitting ? 'Processing Refund...' : 'Refund 100% Capital'}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Locked Until {lockDateStr}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
