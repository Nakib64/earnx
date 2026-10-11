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
  Sparkles,
} from 'lucide-react';
import { SolanaCoinBadge, SolanaWelcomePedestal } from '../common/SolanaIcon';
import { CoinInfo } from '../../types';
import { GlassCard, GlassButton, NumericAmount } from '../design-system';

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
      {/* Liquid Glass Hero Card */}
      <GlassCard
        variant="elevated"
        className="p-6 sm:p-8 text-slate-900 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <SolanaCoinBadge size={46} className="shadow-md shadow-emerald-500/20" />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 ">
                    Solana
                  </h2>
                  <span className="text-xs  font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    SOL
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">Primary Network Asset</p>
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-black   text-slate-900 tabular-nums">
                {coinBalance.toLocaleString()}
              </span>
              <span className="text-sm font-black text-emerald-700 ">SOL</span>
            </div>
          </div>

          {/* Mini Valuation Banner & Curve */}
          <div className="h-16 w-full flex items-end justify-between pt-2">
            <div className="space-y-0.5">
              <span className="text-[10px]  text-slate-400 uppercase tracking-wider block font-bold">
                Estimated Valuation
              </span>
              <span className="text-sm  font-black text-slate-800 tabular-nums">
                ${totalValueUSD.toFixed(2)} USD
              </span>
            </div>

            <div className="w-48 sm:w-80 h-10">
              <svg viewBox="0 0 320 60" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 50 Q 30 45, 60 48 T 120 38 T 180 42 T 240 20 T 320 12 L 320 60 L 0 60 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 0 50 Q 30 45, 60 48 T 120 38 T 180 42 T 240 20 T 320 12"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="320" cy="12" r="4" fill="#059669" />
              </svg>
            </div>
          </div>

          {/* Stats Grid with Specular Highlight Panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 border-t border-slate-200/80 pt-5">
            <div className="bg-white/80 border border-white/95 rounded-2xl p-3.5 space-y-1 specular-rim shadow-xs">
              <div className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-500">Market Rate</span>
              </div>
              <NumericAmount value={coinPriceBDT} size="lg" className="text-slate-900" />
            </div>

            <div className="bg-white/80 border border-white/95 rounded-2xl p-3.5 space-y-1 specular-rim shadow-xs">
              <div className="flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-500">Portfolio Value</span>
              </div>
              <NumericAmount value={totalValueBDT} size="lg" semantic="gain" />
            </div>

            <div className="bg-white/80 border border-white/95 rounded-2xl p-3.5 space-y-1 specular-rim shadow-xs">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-500">Wallet Balance</span>
              </div>
              <NumericAmount value={walletBalanceBDT} size="lg" className="text-slate-900" />
            </div>

            <div className="bg-white/80 border border-white/95 rounded-2xl p-3.5 space-y-1 specular-rim shadow-xs">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-500">Locked Bonus</span>
              </div>
              <div className="text-base font-black text-amber-700  tabular-nums">
                {lockedCoins.toLocaleString()} SOL
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Two-Column Section: Buy Form & Welcome Gift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Buy Form */}
        <GlassCard variant="standard" className="lg:col-span-7 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Purchase SOL Coins</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Buy Solana coins directly from the treasury with cash wallet balance.
                </p>
              </div>
            </div>

            <span className="text-xs  font-black px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                    className="w-full pl-11 pr-12 py-3 bg-white/70 border border-slate-200/90 rounded-2xl  font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm shadow-xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyAmount(buyAmount + 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between shadow-xs specular-rim">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total BDT Cost
                  </p>
                  <NumericAmount value={totalBuyCost} size="base" className=" text-slate-900" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Wallet After
                  </p>
                  <p
                    className={`text-xs  font-bold tabular-nums ${remainingWalletAfterBuy >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                  >
                    ৳{remainingWalletAfterBuy.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={purchasing}
              disabled={purchasing || buyAmount <= 0 || walletBalanceBDT < totalBuyCost}
              icon={<ShoppingCart className="w-4.5 h-4.5" />}
            >
              Buy {buyAmount} SOL (৳{totalBuyCost.toLocaleString()})
            </GlassButton>
          </form>
        </GlassCard>

        {/* Right Col: Welcome Bonus */}
        <GlassCard variant="standard" className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Gift className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">Welcome Bonus Gift</h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            <SolanaWelcomePedestal className="w-24 h-24 shrink-0 drop-shadow-sm" />
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900  tabular-nums">
                {lockedCoins.toFixed(2)} SOL
              </div>
              <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                LOCKED BONUS
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Complete {requiredReferralsCount} referrals to unlock. ({activeReferralsCount}/
                {requiredReferralsCount} done)
              </p>
            </div>
          </div>

          {coinInfo?.can_unlock && !coinInfo.is_premium_coins_unlocked && (
            <GlassButton
              onClick={handleUnlockCoins}
              disabled={unlocking}
              isLoading={unlocking}
              variant="primary"
              fullWidth
              icon={<Unlock className="w-4 h-4" />}
            >
              Unlock Bonus Now!
            </GlassButton>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
