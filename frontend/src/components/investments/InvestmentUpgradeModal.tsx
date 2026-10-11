'use client';

import React from 'react';
import { InvestmentPlan, UserInvestment } from '../../types';
import { TrendingUp, ArrowRight, Wallet, ShieldCheck } from 'lucide-react';

interface InvestmentUpgradeModalProps {
  selectedPlan: InvestmentPlan;
  activeInv: UserInvestment;
  walletBal: number;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function InvestmentUpgradeModal({
  selectedPlan,
  activeInv,
  walletBal,
  submitting,
  onClose,
  onConfirm,
}: InvestmentUpgradeModalProps) {
  const currentAmt = Number(activeInv.amount);
  const targetAmt = Number(selectedPlan.min_amount || selectedPlan.amount || 1000);
  const remainingCost = Math.max(0, targetAmt - currentAmt);
  const isInsufficient = walletBal < remainingCost;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-[family-name:var(--font-montserrat)]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              Upgrade Investment Package
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              Scale up to {selectedPlan.title}
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
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-slate-500 font-medium truncate">
                Current Package ({activeInv.plan?.title || 'Active'}):
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                ৳{currentAmt.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-emerald-800 font-semibold truncate">
                Target Package ({selectedPlan.title}):
              </span>
              <span className="font-bold text-[#009F6B] tabular-nums">
                ৳{targetAmt.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Remaining Cost Card */}
          <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl space-y-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Required Top-Up Amount
            </span>
            <p className="text-3xl font-bold text-white tabular-nums">
              ৳{remainingCost.toLocaleString()}
            </p>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              This upgrade difference will be deducted directly from your Cash Wallet balance (Current Balance: ৳{walletBal.toLocaleString()}).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || isInsufficient}
            className="flex-1 py-3 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            {submitting ? (
              'Upgrading...'
            ) : isInsufficient ? (
              'Insufficient Balance'
            ) : (
              <>
                <span>Confirm Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
