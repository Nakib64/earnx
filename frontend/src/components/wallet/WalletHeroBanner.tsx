'use client';

import React from 'react';
import { ArrowRightLeft, MinusCircle } from 'lucide-react';

interface WalletHeroBannerProps {
  currentBal: number;
  showTransferModal: boolean;
  showWithdrawModal: boolean;
  onToggleTransfer: () => void;
  onToggleWithdraw: () => void;
}

export function WalletHeroBanner({
  currentBal,
  showTransferModal,
  showWithdrawModal,
  onToggleTransfer,
  onToggleWithdraw,
}: WalletHeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        {/* Balance info */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="bg-white/10 border border-[#d4af37]/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-200">
              Main Wallet Balance
            </span>
          </div>

          <div className="flex items-baseline space-x-2 min-w-0">
            <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight truncate">
              ৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">Available BDT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center shrink-0">
          <button
            onClick={onToggleTransfer}
            className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer truncate ${
              showTransferModal
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">Balance Transfer</span>
          </button>

          <button
            onClick={onToggleWithdraw}
            className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer truncate ${
              showWithdrawModal
                ? 'bg-[#03442e] text-amber-200 border-2 border-amber-400'
                : 'bg-[#023322] hover:bg-[#03442e] text-amber-200 border border-[#d4af37]/40'
            }`}
          >
            <MinusCircle className="w-4 h-4 text-[#f3ba2f] shrink-0" />
            <span className="truncate">Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
}
