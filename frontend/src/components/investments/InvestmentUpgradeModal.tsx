'use client';

import React from 'react';
import { InvestmentPlan, UserInvestment } from '../../types';

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
  const targetAmt = Number(selectedPlan.amount || selectedPlan.min_amount);
  const remainingCost = Math.max(0, targetAmt - currentAmt);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
              Upgrade Package
            </h3>
            <p className="text-xs text-slate-500 font-semibold truncate">
              Upgrade from {activeInv.plan?.title || 'Current Package'} to {selectedPlan.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold shrink-0 ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 truncate">
              <span className="text-slate-600 font-bold truncate">
                Current ({activeInv.plan?.title}):
              </span>
              <span className="font-black text-slate-900  truncate">
                ৳{currentAmt.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 truncate">
              <span className="text-[#854D0E] font-bold truncate">
                Target ({selectedPlan.title}):
              </span>
              <span className="font-black text-[#854D0E]  truncate">
                ৳{targetAmt.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Remaining Amount Highlight Card */}
          <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 text-white p-4 rounded-xl space-y-1 shadow-md">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
              Upgrade Cost (Deducted from Wallet)
            </span>
            <p className="text-3xl font-black  truncate text-white">
              ৳{remainingCost.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-300 font-medium">
              This remaining upgrade cost will be deducted directly from your account balance
              (Current Balance: ৳{walletBal.toLocaleString()}).
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-300 font-black text-xs text-slate-700 hover:bg-slate-100 truncate cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md disabled:opacity-50 truncate cursor-pointer"
          >
            {submitting ? 'Submitting Request...' : 'Confirm Upgrade Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
