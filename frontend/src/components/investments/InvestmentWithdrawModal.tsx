'use client';

import React from 'react';
import { UserInvestment } from '../../types';

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
              Withdraw Total Invested Capital
            </h3>
            <p className="text-xs text-slate-500 font-semibold truncate">
              Refund 100% of your invested capital to your wallet
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
          {/* Total Capital Refund Highlight Card */}
          <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 text-white p-5 rounded-2xl space-y-2 shadow-md">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
              Total Active Invested Capital
            </span>
            <p className="text-3xl font-black  truncate text-white">
              ৳{currentAmt.toLocaleString()}
            </p>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              100% of this invested capital (৳{currentAmt.toLocaleString()}) will be refunded
              directly to your account balance instantly upon confirmation, and your investment
              package will be deleted.
            </p>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-[#854D0E] text-xs font-semibold space-y-1">
            <p className="font-extrabold text-[#854D0E]">⚡ Direct & Instant Refund:</p>
            <p className="text-[11px] leading-snug">
              Capital withdrawal refunds 100% of your active invested principal to your account
              balance immediately. Your active package will be deleted.
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
            {submitting ? 'Processing Refund...' : 'Refund 100% Capital'}
          </button>
        </div>
      </div>
    </div>
  );
}
