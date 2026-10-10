'use client';

import React from 'react';
import { ArrowRightLeft, MinusCircle, Wallet, Sparkles } from 'lucide-react';
import { GlassCard, GlassButton, NumericAmount } from '../design-system';

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
    <GlassCard
      variant="elevated"
      className="p-6 sm:p-8 text-slate-900 relative overflow-hidden space-y-6"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        {/* Balance info */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available Cash Balance</span>
            </span>
          </div>

          <div className="flex items-baseline space-x-2 min-w-0">
            <NumericAmount
              value={currentBal}
              size="3xl"
              className="font-black text-slate-900"
            />
            <span className="text-xs sm:text-sm font-bold text-slate-500 font-sans">
              BDT Available
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center shrink-0">
          <GlassButton
            onClick={onToggleTransfer}
            variant={showTransferModal ? 'primary' : 'secondary'}
            size="md"
            icon={<ArrowRightLeft className="w-4 h-4 shrink-0" />}
          >
            Balance Transfer
          </GlassButton>

          <GlassButton
            onClick={onToggleWithdraw}
            variant={showWithdrawModal ? 'primary' : 'secondary'}
            size="md"
            icon={<MinusCircle className="w-4 h-4 shrink-0" />}
          >
            Withdraw
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}
