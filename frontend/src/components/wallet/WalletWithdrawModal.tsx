'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface WalletWithdrawModalProps {
  currentBal: number;
  withdrawAmount: string;
  setWithdrawAmount: (amt: string) => void;
  submittingWithdraw: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function WalletWithdrawModal({
  currentBal,
  withdrawAmount,
  setWithdrawAmount,
  submittingWithdraw,
  onSubmit,
  onCancel,
}: WalletWithdrawModalProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-200 space-y-4 shadow-md animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-base truncate">Submit Direct Withdrawal</h3>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
            Withdrawal Amount (৳)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            max={currentBal}
            required
            placeholder="Enter withdrawal amount..."
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-slate-900"
          />
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 font-mono">
            <span>Available Balance: <strong>৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
            <button
              type="button"
              onClick={() => setWithdrawAmount(String(currentBal))}
              className="text-[#005A36] hover:underline font-bold cursor-pointer"
            >
              Withdraw All
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            submittingWithdraw ||
            parseFloat(withdrawAmount) <= 0 ||
            parseFloat(withdrawAmount) > currentBal
          }
          className="w-full bg-[#005A36] hover:bg-[#044D2F] text-white py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
        >
          <Send className="w-4 h-4 text-secondary shrink-0" />
          <span>{submittingWithdraw ? 'Processing Withdrawal...' : 'Confirm & Withdraw'}</span>
        </button>
      </form>
    </div>
  );
}
