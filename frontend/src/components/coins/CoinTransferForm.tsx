'use client';

import React from 'react';
import { Users, AlertCircle, RefreshCw, Send, ArrowRightLeft } from 'lucide-react';
import { SolanaCoinBadge } from '../common/SolanaIcon';

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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#005A36] shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">P2P Coin Transfer</h2>
            <p className="text-xs font-semibold text-slate-500">
              Transfer Solana coins to another user at your custom agreed exchange rate
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Recipient Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Recipient Phone / Email / Referral Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. 01700000000 or user@mail.com or REF123"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-sm"
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
                Available: <strong className="text-[#005A36] font-mono">{coinBalance} SOL</strong>
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3">
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
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-base"
              />
            </div>
          </div>

          {/* Custom Coin Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Coin Rate (1 Coin = ? ৳ BDT) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-black text-sm">৳</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 120"
                value={transferCoinRate}
                onChange={(e) => setTransferCoinRate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-base"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Default market rate is ৳{coinPriceBDT}. You may enter any custom agreed rate with the receiver.
            </p>
          </div>

          {/* Calculated Value Display Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Total BDT Equivalent
              </span>
              <div className="text-xl font-black text-[#005A36] font-mono">
                ৳{calcTotalTransferBDT.toLocaleString()} BDT
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-emerald-700">
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-medium text-amber-900 space-y-1">
            <span className="font-black text-amber-950 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Escrow Protection:
            </span>
            <p>
              Coins are securely locked in escrow. The receiver must review and accept this transfer before coins are credited. If rejected, coins return immediately.
            </p>
          </div>

          <button
            type="submit"
            disabled={transferring || calcTransferCoins <= 0 || calcTransferCoins > coinBalance}
            className="w-full py-4 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/20 cursor-pointer"
          >
            {transferring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Initiating Transfer...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-emerald-300" />
                <span>Send Transfer Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
