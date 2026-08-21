'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { CoinInfo, CoinTransaction } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  SolanaIcon,
  SolanaCoinBadge,
  SolanaWelcomePedestal,
} from '../../../components/common/SolanaIcon';
import {
  Lock,
  Unlock,
  Wallet,
  History,
  ShoppingCart,
  TrendingUp,
  ChevronRight,
  Gift,
  Users,
  Copy,
  Check,
  Tag,
  Info,
  Clock,
  Sparkles,
  X,
  Share2,
  Plus,
  Minus,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function UserCoinsPage() {
  const { user, refreshUserProfile } = useAuth();
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(10);
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '1M' | '1Y' | 'ALL'>('24H');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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
        text: `🎉 Successfully purchased ${data.amount} SOL coins for ৳${(data.cost || 0).toLocaleString()}!`,
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
        text: `🎉 Congratulations! You have unlocked ${data.unlocked_amount} SOL bonus coins to your available balance!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to unlock coins.' });
    }
    setUnlocking(false);
  };

  const handleCopyReferralLink = () => {
    const code = user?.referral_code || '';
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Dynamic values derived from backend API response (coinInfo)
  const coinBalance = coinInfo?.coin_balance ?? 0;
  const lockedCoins = coinInfo?.locked_coin_balance ?? 0;
  const coinPriceBDT = coinInfo?.coin_price ?? 10;
  const walletBalanceBDT = coinInfo?.wallet_balance ?? 0;

  // Total BDT / USD calculations
  const totalValueBDT = coinBalance * coinPriceBDT;
  const totalValueUSD = totalValueBDT / 120;
  const totalBuyCost = (buyAmount || 0) * coinPriceBDT;
  const remainingWalletAfterBuy = walletBalanceBDT - totalBuyCost;

  const activeReferralsCount = coinInfo?.active_referral_count ?? 0;
  const requiredReferralsCount = coinInfo?.required_referral_count ?? 10;
  const remainingReferrals = Math.max(0, requiredReferralsCount - activeReferralsCount);


  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      {/* Top Bar / Heading */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          My Coins
        </h1>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* ---------------------------------------------------- */}
      {/* HERO SECTION: Dark Emerald Solana Overview Card */}
      {/* ---------------------------------------------------- */}
      <div className="bg-gradient-to-br from-[#061812] via-[#082319] to-[#04100c] border border-[#174635] rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
        {/* Ambient glow lights */}
        <div className="absolute top-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Hero Top Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Solana Logo & Real Balance */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-950/80 border-2 border-emerald-500/40 p-2.5 flex items-center justify-center shrink-0 shadow-xl shadow-emerald-950/50">
                <SolanaIcon className="w-10 h-10" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  SOLANA (SOL)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  {loading ? '...' : `${Number(coinBalance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} SOL`}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  ≈ ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (≈ ৳{totalValueBDT.toLocaleString()})
                </div>
              </div>
            </div>

            {/* Right: Timefilter & Green Sparkline Chart */}
            <div className="flex flex-col items-end space-y-2">
              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-7"
                >
                  <option value="24H">24H</option>
                  <option value="7D">7D</option>
                  <option value="1M">1M</option>
                  <option value="1Y">1Y</option>
                  <option value="ALL">ALL</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400 text-xs">
                  ▼
                </div>
              </div>

              {/* Sparkline chart SVG */}
              <div className="w-full md:w-80 h-16 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 60" fill="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00ffa3" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#00ffa3" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
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
                    filter="url(#glow)"
                  />
                  <circle cx="320" cy="12" r="4" fill="#00ffa3" />
                  <circle cx="320" cy="12" r="8" fill="#00ffa3" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Hero Bottom Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-5">
            {/* Stat 1: Current Price */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-400">Current Price</span>
              </div>
              <div className="text-lg font-black text-white font-mono">৳{coinPriceBDT.toLocaleString()}</div>
              <div className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                +7.35% ↑
              </div>
            </div>

            {/* Stat 2: Total Value */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-400">Total Value</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 font-mono">
                ≈ ৳{totalValueBDT.toLocaleString()}
              </div>
            </div>

            {/* Stat 3: Wallet Balance */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-400">Main Wallet</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                ৳{walletBalanceBDT.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold text-emerald-400">
                Spendable & Tradeable
              </div>
            </div>

            {/* Stat 4: Locked Bonus Coins */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-400">Locked Bonus</span>
              </div>
              <div className="text-lg font-black text-amber-200 font-mono">
                {lockedCoins.toLocaleString()} SOL
              </div>
              <div className="text-[10px] font-semibold text-amber-400">
                {activeReferralsCount} / {requiredReferralsCount} Referrals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: Your Purchase History Table Card */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <History className="w-5 h-5 text-emerald-700" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your Purchase History</h2>
          </div>

          <Link
            href="/dashboard/transactions"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Transactions</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Purchase History Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Coin</th>
                <th className="px-4 py-3.5">Quantity</th>
                <th className="px-4 py-3.5">Price per SOL</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    Loading transactions history...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No transactions recorded yet. Use the form below to purchase SOL coins.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => {
                  const txAmount = Number(tx.amount);
                  const txCostBDT = tx.cost_bdt ? Number(tx.cost_bdt) : txAmount * coinPriceBDT;
                  const unitPrice = txAmount > 0 ? txCostBDT / txAmount : coinPriceBDT;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4 text-slate-400 font-mono text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-4 text-slate-700 text-xs font-medium">
                        {new Date(tx.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}, {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1.5">
                          <SolanaCoinBadge size={22} />
                          <span className="font-bold text-slate-900 text-xs">SOL</span>
                          <span className="text-slate-400 font-semibold">→</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-slate-900 text-xs">
                        +{txAmount.toFixed(2)} SOL
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-700 text-xs">
                        ৳{unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          ৳{txCostBDT.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ≈ ${(txCostBDT / 120).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Total Holdings Summary Row */}
          <div className="bg-slate-50/90 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-700 gap-2">
            <span className="text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
              Total Holdings
            </span>
            <div className="flex items-center space-x-3 font-mono">
              <span className="text-sm font-extrabold text-emerald-700">
                {coinBalance.toFixed(2)} SOL
              </span>
              <span className="text-slate-400 font-normal">
                ≈ ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (≈ ৳{totalValueBDT.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: Bottom Two-Column Layout */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 7): Welcome Coin Gift + Buy Coins Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Your Welcome Coin (Gift) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Gift className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Your Welcome Coin (Gift)</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
              {/* 3D Solana Pedestal Illustration */}
              <SolanaWelcomePedestal className="w-36 h-36 shrink-0" />

              {/* Bonus Information */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {lockedCoins.toFixed(2)} SOL
                </div>
                <div className="inline-block bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-amber-200">
                  FREE ACCOUNT BONUS
                </div>
                <p className="text-xs text-slate-500 font-medium max-w-xs">
                  Complete {requiredReferralsCount} successful referrals to unlock your reward.
                </p>

                {coinInfo?.can_unlock && !coinInfo.is_premium_coins_unlocked && (
                  <button
                    onClick={handleUnlockCoins}
                    disabled={unlocking}
                    className="mt-2 py-2 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{unlocking ? 'Unlocking...' : 'Unlock Reward Now!'}</span>
                  </button>
                )}
              </div>

              {/* Referral Progress Sub-card */}
              <div className="w-full sm:w-48 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">Referral Progress</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>

                <div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {activeReferralsCount} / {requiredReferralsCount}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    Referrals Completed
                  </div>
                </div>

                {/* 10 Segmented Progress Bar */}
                <div className="flex items-center gap-1 pt-1">
                  {Array.from({ length: requiredReferralsCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        i < activeReferralsCount
                          ? 'bg-emerald-500 shadow-sm'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-[11px] font-semibold text-slate-400">
                  {remainingReferrals} referrals remaining
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: BUY COIN FORM (Replaces Referral List) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Purchase SOL Coins</h2>
                  <p className="text-xs text-slate-500 font-medium">Buy Solana coins directly using your main wallet balance.</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-300 border border-emerald-500/30">
                ৳{coinPriceBDT.toLocaleString()} / SOL
              </span>
            </div>

            <form onSubmit={handleBuyCoins} className="space-y-4">

              {/* Custom Quantity Input with Counter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Custom Quantity (SOL)
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
                      className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#023322] text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                        className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuyAmount(buyAmount + 1)}
                        className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
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

              {/* Purchase CTA Submit Button */}
              <button
                type="submit"
                disabled={purchasing || buyAmount <= 0 || walletBalanceBDT < totalBuyCost}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
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
        </div>

        {/* Right Column (Span 5): Invite & Earn More */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Invite & Earn More
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">
                    Invite your friends and earn amazing rewards together.
                  </p>
                </div>

                {/* 3D Gift Box Decorative Illustration */}
                <div className="w-24 h-24 relative shrink-0">
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                    <ellipse cx="60" cy="105" rx="40" ry="8" fill="#000000" opacity="0.15" />
                    
                    <rect x="25" y="45" width="70" height="55" rx="8" fill="#064E3B" />
                    <rect x="25" y="45" width="35" height="55" fill="#047857" opacity="0.4" />

                    <rect x="52" y="45" width="16" height="55" fill="#F59E0B" />
                    <rect x="25" y="65" width="70" height="14" fill="#F59E0B" />

                    <rect x="20" y="35" width="80" height="15" rx="4" fill="#065F46" stroke="#047857" strokeWidth="1" />
                    <rect x="50" y="35" width="20" height="15" fill="#FBBF24" />

                    <path d="M 60 35 C 45 15, 30 25, 55 35 Z" fill="#F59E0B" />
                    <path d="M 60 35 C 75 15, 90 25, 65 35 Z" fill="#F59E0B" />
                    <circle cx="60" cy="35" r="5" fill="#FDE047" />

                    <path d="M 20 25 L 23 30 L 28 31 L 24 35 L 25 40 L 20 37 L 15 40 L 16 35 L 12 31 L 17 30 Z" fill="#FBBF24" />
                    <circle cx="95" cy="25" r="3" fill="#34D399" />
                    <circle cx="15" cy="70" r="2.5" fill="#FBBF24" />
                  </svg>
                </div>
              </div>
            </div>



            {/* How it works link */}
            <div className="flex justify-end pt-2">
              <Link
                href="/dashboard/referral"
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <span>How it works?</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
