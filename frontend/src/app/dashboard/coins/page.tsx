'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { CoinInfo, CoinTransaction } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Coins,
  Lock,
  Unlock,
  Wallet,
  Users,
  History,
  ShoppingCart,
  TrendingUp,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function UserCoinsPage() {
  const { refreshUserProfile } = useAuth();
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(50);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [infoRes, txRes] = await Promise.all([
      apiFetch<CoinInfo>('/coins/info'),
      apiFetch<CoinTransaction[]>('/coins/transactions'),
    ]);

    if (infoRes.success && infoRes.data) {
      const data = (infoRes.data as any).data || infoRes.data;
      setCoinInfo(data);
    }
    if (txRes.success && txRes.data) {
      const data = (txRes.data as any).data || txRes.data;
      setTransactions(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const handleBuyCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinInfo) return;
    if (buyAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid coin amount greater than 0.' });
      return;
    }

    const totalCost = buyAmount * coinInfo.coin_price;
    if (coinInfo.wallet_balance < totalCost) {
      setMessage({
        type: 'error',
        text: `Insufficient wallet balance. Total cost is ৳${totalCost.toLocaleString()}, but you only have ৳${coinInfo.wallet_balance.toLocaleString()}.`,
      });
      return;
    }

    setPurchasing(true);
    setMessage(null);

    const res = await apiFetch<{ amount: number; cost: number; new_coin_balance: number }>(
      '/coins/buy',
      {
        method: 'POST',
        body: JSON.stringify({ amount: buyAmount }),
      },
    );

    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setMessage({
        type: 'success',
        text: `Successfully purchased ${data.amount} coins for ৳${(data.cost || 0).toLocaleString()}!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to purchase coins.' });
    }
    setPurchasing(false);
  };

  const handleUnlockCoins = async () => {
    setUnlocking(true);
    setMessage(null);

    const res = await apiFetch<{ unlocked_amount: number; new_coin_balance: number }>(
      '/coins/unlock-premium',
      { method: 'POST' },
    );

    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setMessage({
        type: 'success',
        text: `🎉 Congratulations! You have unlocked ${data.unlocked_amount} premium bonus coins to your available balance!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to unlock coins.' });
    }
    setUnlocking(false);
  };

  const currentCoinPrice = coinInfo?.coin_price || 10;
  const totalBuyCost = (buyAmount || 0) * currentCoinPrice;
  const referralProgress = coinInfo
    ? Math.min(100, (coinInfo.active_referral_count / coinInfo.required_referral_count) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Card 1: Available Coins */}
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Available Coins
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-primary shrink-0">
              <Coins className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                {loading ? '...' : (coinInfo?.coin_balance ?? 0).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-primary">Coins</div>
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-primary">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>+0% this week</span>
          </div>
        </div>

        {/* Card 2: Location Pools / Referral Lock */}
        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Location Pools
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-800 shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-[#854D0E] font-mono tracking-tight">
                {loading ? '...' : (coinInfo?.active_referral_count ?? 0)}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#854D0E]">
               Referral
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/referral"
            className="w-full bg-[#FFF0E5] hover:bg-[#FFE5D2] text-[#854D0E] font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>View Referrals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Wallet Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          Main Wallet
        </span>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-base font-black text-slate-900 font-mono mt-0.5">
                ৳{loading ? '...' : (coinInfo?.wallet_balance ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/wallet"
            className="bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200/80 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 shrink-0 transition-colors"
          >
            <span>View Wallet</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Green Banner: Premium Bonus Coins */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-4">
        <div className="flex items-start space-x-3">
          <div className="text-3xl shrink-0">🎁</div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
              You have {coinInfo?.locked_coin_balance ?? 1} Premium Bonus Coin{' '}
              <span className="text-secondary font-black">Locked</span>
            </h3>
            <p className="text-xs text-emerald-100/90 font-medium">
              🎉 Participate in active campaigns to unlock your bonus!
            </p>
          </div>
        </div>

        <div className="border-t border-emerald-700/60 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>
                <strong className="text-secondary font-mono">
                  {coinInfo?.active_referral_count || 0}
                </strong>{' '}
                Successful Active Referrals
              </span>
            </div>
            <div className="font-mono text-secondary font-extrabold">
              {coinInfo?.active_referral_count || 0} / {coinInfo?.required_referral_count || 10}{' '}
              Active Users
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-emerald-950/60 rounded-full h-2.5 p-0.5 overflow-hidden border border-emerald-600/40">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${referralProgress}%` }}
            />
          </div>
        </div>

        {/* Unlock Button if condition met */}
        {coinInfo?.can_unlock && !coinInfo.is_premium_coins_unlocked && (
          <button
            onClick={handleUnlockCoins}
            disabled={unlocking}
            className="w-full py-2.5 px-4 bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Unlock className="w-4 h-4" />
            <span>{unlocking ? 'Unlocking...' : `Unlock Bonus Coins Now!`}</span>
          </button>
        )}
      </div>

      {/* Purchase Coins Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Purchase Coins</h2>
          </div>

          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-50 text-primary border border-emerald-200/80 font-mono">
          ৳{currentCoinPrice.toLocaleString()} / Coin
          </span>
        </div>

        {/* Stacked Presets List matching image */}
        <div className="space-y-3">
          {[10, 100, 500].map((preset) => {
            const cost = preset * currentCoinPrice;
            const isSelected = buyAmount === preset;
            return (
              <div
                key={preset}
                onClick={() => setBuyAmount(preset)}
                className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-extrabold text-slate-800">+{preset} Coins</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBuyAmount(preset);
                  }}
                  className={`py-2 px-5 rounded-xl font-extrabold text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-[#005A36] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-[#005A36] text-slate-800 hover:text-white'
                  }`}
                >
                  ৳ {cost.toLocaleString()}
                </button>
              </div>
            );
          })}
        </div>

        {/* Custom Quantity Form & Confirm Button */}
        <form onSubmit={handleBuyCoins} className="pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Custom Quantity
              </label>
              <div className="relative">
                <Coins className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={buyAmount || ''}
                  onChange={(e) => setBuyAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="Enter coin count..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Cost
                </p>
                <p className="text-lg font-black text-slate-900 font-mono">
                  ৳{totalBuyCost.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Wallet After
                </p>
                <p
                  className={`text-xs font-extrabold font-mono ${
                    (coinInfo?.wallet_balance || 0) - totalBuyCost >= 0
                      ? 'text-primary'
                      : 'text-rose-700'
                  }`}
                >
                  ৳{((coinInfo?.wallet_balance || 0) - totalBuyCost).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={purchasing || buyAmount <= 0 || (coinInfo?.wallet_balance || 0) < totalBuyCost}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
          >
            <ShoppingCart className="w-4 h-4 text-secondary" />
            <span>
              {purchasing ? 'Processing...' : `Confirm & Buy ${buyAmount} Coins (৳${totalBuyCost.toLocaleString()})`}
            </span>
          </button>
        </form>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-slate-600" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Coin Transaction History
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Coins</th>
                <th className="px-4 py-3 text-right">Note & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-xs text-slate-900 font-mono">
                          +{Number(tx.amount).toLocaleString()} Coins
                        </span>
                        {tx.cost_bdt && (
                          <span className="text-[10px] text-primary font-extrabold">
                            (৳{Number(tx.cost_bdt).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-700 text-xs font-semibold truncate max-w-[200px] ml-auto">
                        {tx.description || '-'}
                      </div>
                      <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
