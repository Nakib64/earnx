'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { CoinInfo, CoinTransaction } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { GoldenCoinsIcon } from '../../../components/common/GoldenCoinsIcon';
import {
  Lock,
  Unlock,
  Wallet,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Available Coins */}
        <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
            Available <GoldenCoinsIcon size={20} />
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-[#d4af37]/60 bg-amber-500/10 flex items-center justify-center shrink-0">
              <GoldenCoinsIcon size={32} />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-1.5">
                {loading ? '...' : (coinInfo?.coin_balance ?? 0).toLocaleString()}
                <GoldenCoinsIcon size={26} />
              </div>
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                EarnX <GoldenCoinsIcon size={16} />
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-amber-200">
            <TrendingUp className="w-4 h-4 text-[#f3ba2f]" />
            <span>Spendable & Tradeable</span>
          </div>
        </div>

        {/* Card 2: Location Pools / Referral Lock */}
        <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest">
            Referral Lock Requirement
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-100 font-mono tracking-tight">
                {loading ? '...' : (coinInfo?.active_referral_count ?? 0)}
              </div>
              <div className="text-xs font-bold text-amber-300">
                Active Referrals Count
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/referral"
            className="w-full bg-[#3d2705] hover:bg-[#4d3207] text-amber-200 border border-amber-500/40 font-black text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>View Referrals</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>
      </div>

      {/* Main Wallet Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
          Main Wallet
        </span>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
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
            className="bg-[#01281a] hover:bg-[#023c28] text-amber-200 border border-[#d4af37]/40 font-black text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shrink-0 transition-colors shadow-sm"
          >
            <span>View Wallet</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>
      </div>

      {/* Luxury Dark Emerald Banner: Premium Bonus Coins */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-[#023322] border border-[#d4af37]/40 shrink-0">
            <GoldenCoinsIcon size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center flex-wrap gap-1.5">
              You have {coinInfo?.locked_coin_balance ?? 1} Premium Bonus <GoldenCoinsIcon size={22} />{' '}
              <span className="text-[#f3ba2f] font-black">Locked</span>
            </h3>
            <p className="text-xs text-slate-300 font-semibold">
              Participate in active campaigns to unlock your bonus!
            </p>
          </div>
        </div>

        <div className="border-t border-[#053d29] pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#f3ba2f]" />
              <span>
                <strong className="text-[#f3ba2f] font-mono">
                  {coinInfo?.active_referral_count || 0}
                </strong>{' '}
                Successful Active Referrals
              </span>
            </div>
            <div className="font-mono text-[#f3ba2f] font-black">
              {coinInfo?.active_referral_count || 0} / {coinInfo?.required_referral_count || 10}{' '}
              Active Users
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#023322] rounded-full h-2.5 p-0.5 overflow-hidden border border-[#d4af37]/30">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${referralProgress}%` }}
            />
          </div>
        </div>

        {/* Unlock Button if condition met */}
        {coinInfo?.can_unlock && !coinInfo.is_premium_coins_unlocked && (
          <button
            onClick={handleUnlockCoins}
            disabled={unlocking}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span className="flex items-center gap-1">
              {unlocking ? 'Unlocking...' : `Unlock Bonus`} <GoldenCoinsIcon size={18} /> Now!
            </span>
          </button>
        )}
      </div>

      {/* Purchase Coins Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
              Purchase <GoldenCoinsIcon size={24} />
            </h2>
          </div>

          <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-[#01281a] text-amber-200 border border-[#d4af37]/40 font-mono flex items-center gap-1">
            ৳{currentCoinPrice.toLocaleString()} / <GoldenCoinsIcon size={16} />
          </span>
        </div>



        {/* Custom Quantity Form & Confirm Button */}
        <form onSubmit={handleBuyCoins} className="pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Custom Quantity
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <GoldenCoinsIcon size={20} />
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={buyAmount || ''}
                  onChange={(e) => setBuyAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="Enter count..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-sm"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Total Cost
                </p>
                <p className="text-lg font-black text-slate-900 font-mono">
                  ৳{totalBuyCost.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Wallet After
                </p>
                <p
                  className={`text-xs font-black font-mono ${
                    (coinInfo?.wallet_balance || 0) - totalBuyCost >= 0
                      ? 'text-[#01281a]'
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
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <ShoppingCart className="w-4 h-4 text-slate-950" />
            <span className="flex items-center gap-1.5">
              {purchasing ? 'Processing...' : `Confirm & Buy ${buyAmount}`} <GoldenCoinsIcon size={18} /> (৳{totalBuyCost.toLocaleString()})
            </span>
          </button>
        </form>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <GoldenCoinsIcon size={22} />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Transaction History
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 flex items-center gap-1">
                  Amount <GoldenCoinsIcon size={14} />
                </th>
                <th className="px-4 py-3 text-right">Note & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-slate-400 font-bold">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-slate-400 font-bold">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-xs text-slate-900 font-mono flex items-center gap-1">
                          +{Number(tx.amount).toLocaleString()} <GoldenCoinsIcon size={16} />
                        </span>
                        {tx.cost_bdt && (
                          <span className="text-[10px] text-[#01281a] font-black">
                            (৳{Number(tx.cost_bdt).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-700 text-xs font-bold truncate max-w-[200px] ml-auto">
                        {tx.description || '-'}
                      </div>
                      <div className="text-slate-400 text-[10px] font-mono font-semibold mt-0.5">
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
