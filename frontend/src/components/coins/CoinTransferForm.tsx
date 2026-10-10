'use client';

import React from 'react';
import { Users, AlertCircle, Send, ArrowRightLeft } from 'lucide-react';
import { SolanaCoinBadge } from '../common/SolanaIcon';
import { GlassCard, GlassButton, NumericAmount } from '../design-system';

interface CoinTransferFormProps {
  transferRecipient: string;
  setTransferRecipient: (val: string) => void;
  transferCoinAmount: string;
  setTransferCoinAmount: (val: string) => void;
  transferCoinRate: string;
  setTransferCoinRate: (val: string) => void;
  transferNote: string;
  setTransferNote: (val: string) => void;
  coinBalance: number;
  coinPriceBDT: number;
  transferring: boolean;
  onSubmit: (e?: React.FormEvent) => void;
}

export function CoinTransferForm({
  transferRecipient,
  setTransferRecipient,
  transferCoinAmount,
  setTransferCoinAmount,
  transferCoinRate,
  setTransferCoinRate,
  transferNote,
  setTransferNote,
  coinBalance,
  coinPriceBDT,
  transferring,
  onSubmit,
}: CoinTransferFormProps) {
  const calcTransferCoins = parseFloat(transferCoinAmount) || 0;
  const calcTransferRate = parseFloat(transferCoinRate) || 0;
  const calcTotalTransferBDT = calcTransferCoins * calcTransferRate;

  return (
    <div className="max-w-xl mx-auto">
      <GlassCard variant="standard" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">P2P Coin Transfer</h2>
            <p className="text-xs font-semibold text-slate-500">
              Transfer Solana coins to another user at your custom agreed exchange rate
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Recipient Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Recipient Identifier (Phone / Email / Referral) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. 01700000000 or user@mail.com or REF123"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200/90 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm shadow-xs"
              />
            </div>
          </div>

          {/* Coin Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Coin Amount (SOL) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Available: <strong className="text-emerald-700  font-black">{coinBalance} SOL</strong>
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3.5">
                <SolanaCoinBadge size={20} />
              </div>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="Enter SOL amount"
                value={transferCoinAmount}
                onChange={(e) => setTransferCoinAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200/90 rounded-2xl  font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base shadow-xs"
              />
            </div>
          </div>

          {/* Custom Coin Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Coin Rate (1 Coin = ? ৳ BDT) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-black text-sm">৳</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 120"
                value={transferCoinRate}
                onChange={(e) => setTransferCoinRate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white/70 border border-slate-200/90 rounded-2xl  font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base shadow-xs"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Market price is ৳{coinPriceBDT}. You may enter any custom agreed rate with the receiver.
            </p>
          </div>

          {/* Calculated Value Display Card */}
          <div className="bg-white/80 border border-white/95 rounded-2xl p-4 flex items-center justify-between shadow-xs specular-rim">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Total BDT Valuation
              </span>
              <div className="mt-0.5">
                <NumericAmount value={calcTotalTransferBDT} size="xl" semantic="gain" />
              </div>
            </div>
            <div className="text-right text-xs font-bold text-slate-500 ">
              {calcTransferCoins} SOL × ৳{calcTransferRate}
            </div>
          </div>

          {/* Transfer Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Note to Receiver (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Payment for design work"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Escrow Disclaimer Pill */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs font-medium text-amber-900 space-y-1">
            <span className="font-black text-amber-950 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Escrow Protection:
            </span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Coins are safely locked in escrow. The receiver must review and accept this transfer before coins are credited. If rejected, coins return immediately to your balance.
            </p>
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={transferring}
            icon={<Send className="w-4.5 h-4.5" />}
          >
            Initiate Escrow Transfer
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
