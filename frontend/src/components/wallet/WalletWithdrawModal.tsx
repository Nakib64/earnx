'use client';

import React from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import { GlassCard, GlassButton, NumericAmount } from '../design-system';

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
    <GlassCard variant="standard" className="p-5 sm:p-7 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-slate-900 text-base  truncate">
          Submit Direct Withdrawal
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
            Withdrawal Amount (৳) <span className="text-rose-500">*</span>
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
            className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500  font-black text-slate-900 shadow-xs"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500 ">
            <span>
              Available: <strong>৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </span>
            <button
              type="button"
              onClick={() => setWithdrawAmount(String(currentBal))}
              className="text-emerald-700 hover:underline font-bold cursor-pointer"
            >
              Withdraw Max
            </button>
          </div>
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={submittingWithdraw}
          disabled={
            submittingWithdraw ||
            parseFloat(withdrawAmount) <= 0 ||
            parseFloat(withdrawAmount) > currentBal
          }
          icon={<Send className="w-4.5 h-4.5" />}
        >
          Submit Withdrawal
        </GlassButton>
      </form>
    </GlassCard>
  );
}
