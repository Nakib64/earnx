'use client';

import React from 'react';
import {
  Tag,
  Wallet,
  TrendingUp,
  Lock,
  ShoppingCart,
  Minus,
  Plus,
  Gift,
  Unlock,
} from 'lucide-react';
import { SolanaCoinBadge, SolanaWelcomePedestal } from '../common/SolanaIcon';
import { CoinInfo } from '../../types';

interface CoinOverviewTabProps {
  coinInfo: CoinInfo | null;
  buyAmount: number;
  setBuyAmount: (amt: number) => void;
  purchasing: boolean;
  unlocking: boolean;
  handleBuyCoins: (e?: React.FormEvent) => void;
  handleUnlockCoins: () => void;
}

export function CoinOverviewTab({
  coinInfo,
  buyAmount,
  setBuyAmount,
  purchasing,
  unlocking,
  handleBuyCoins,
  handleUnlockCoins,
}: CoinOverviewTabProps) {
  const coinBalance = Number(coinInfo?.coin_balance ?? 0);
  const lockedCoins = Number(coinInfo?.locked_bonus_coins ?? coinInfo?.locked_coin_balance ?? 0);
  const coinPriceBDT = Number(coinInfo?.coin_price ?? 120);
  const walletBalanceBDT = Number(coinInfo?.wallet_balance ?? 0);

  const totalValueBDT = coinBalance * coinPriceBDT;
  const totalValueUSD = totalValueBDT / 120;
  const totalBuyCost = (buyAmount || 0) * coinPriceBDT;
  const remainingWalletAfterBuy = walletBalanceBDT - totalBuyCost;

  const activeReferralsCount = coinInfo?.active_referral_count ?? 0;
  const requiredReferralsCount = coinInfo?.required_referral_count ?? 10;

  return (
    <div className="space-y-6">
      {/* Dark Luxury Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#00170f] border border-slate-800 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <SolanaCoinBadge size={44} className="shadow-lg shadow-emerald-500/20" />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Solana
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SOL
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Main Portfolio Coin</p>
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {coinBalance.toLocaleString()}
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">SOL</span>
            </div>
          </div>

          {/* Mini Chart Curve */}
          <div className="h-16 w-full flex items-end justify-between pt-2">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Estimated USD
              </span>
              <span className="text-sm font-mono font-black text-slate-200">
                ${totalValueUSD.toFixed(2)} USD
              </span>
            </div>

            <div className="w-48 sm:w-80 h-10">
              <svg viewBox="0 0 320 60" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffa3" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00ffa3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 50 Q 30 45, 60 48 T 120 38 T 180 42 T 240 20 T 320 12 L 320 60 L 0 60 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 0 50 Q 30 45, 60 48 T 120 38 T 180 42 T 240 20 T 320 12"
                  fill="none"
                  stroke="#00ffa3"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="320" cy="12" r="4" fill="#00ffa3" />
              </svg>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-5">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-slate-400">Current Price</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                ৳{coinPriceBDT.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-slate-400">Total Value</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                ৳{totalValueBDT.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-slate-400">Main Wallet</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                ৳{walletBalanceBDT.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-medium text-slate-400">Locked Bonus</span>
              </div>
              <div className="text-lg font-black text-amber-200 font-mono">
                {lockedCoins.toLocaleString()} SOL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Buy Form & Welcome Gift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Buy Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Purchase SOL Coins</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Buy Solana coins directly using your main wallet balance.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-black px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-300 border border-emerald-500/30">
              ৳{coinPriceBDT.toLocaleString()} / SOL
            </span>
          </div>

          <form onSubmit={handleBuyCoins} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Quantity (SOL)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <SolanaCoinBadge size={20} />
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={buyAmount || ''}
                    onChange={(e) => setBuyAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="Enter coin amount..."
                    className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                      className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyAmount(buyAmount + 1)}
                      className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total BDT Cost
                  </p>
                  <p className="text-lg font-black text-slate-900 font-mono">
                    ৳{totalBuyCost.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Wallet After
                  </p>
                  <p
                    className={`text-xs font-mono font-bold ${
                      remainingWalletAfterBuy >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    ৳{remainingWalletAfterBuy.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={purchasing || buyAmount <= 0 || walletBalanceBDT < totalBuyCost}
              className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-100" />
              <span>
                {purchasing
                  ? 'Processing Purchase...'
                  : `Confirm & Buy ${buyAmount} SOL (৳${totalBuyCost.toLocaleString()})`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Col: Welcome Bonus */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Gift className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">Welcome Bonus Gift</h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            <SolanaWelcomePedestal className="w-28 h-28 shrink-0" />
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {lockedCoins.toFixed(2)} SOL
              </div>
              <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-200">
                LOCKED BONUS
              </span>
              <p className="text-[11px] text-slate-500">
                Complete {requiredReferralsCount} referrals to unlock. ({activeReferralsCount}/
                {requiredReferralsCount} done)
              </p>
            </div>
          </div>

          {coinInfo?.can_unlock && !coinInfo.is_premium_coins_unlocked && (
            <button
              onClick={handleUnlockCoins}
              disabled={unlocking}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{unlocking ? 'Unlocking...' : 'Unlock Bonus Now!'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
