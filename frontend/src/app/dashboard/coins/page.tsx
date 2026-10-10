'use client';

import React from 'react';
import Link from 'next/link';
import {
  Send,
  Inbox,
  History,
  Coins,
  TrendingUp,
  Wallet,
  Crown,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useCoinOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import {
  CoinOverviewTab,
  CoinTransferForm,
  CoinIncomingTransfers,
  CoinHistoryTab,
  CoinsSkeleton,
} from '../../../components/coins';

export default function UserCoinsPage() {
  const { isLoading: isSkeletonReviewMode } = useDesignSystem();
  const {
    state: {
      activeTab,
      coinInfo,
      loading,
      purchasing,
      unlocking,
      buyAmount,
      message,
      pendingTransfers,
      transferHistory,
      loadingTransfers,
      transferRecipient,
      transferCoinAmount,
      transferCoinRate,
      transferNote,
      transferring,
      approvingId,
      rejectingId,
    },
    computed: { user },
    actions: {
      setActiveTab,
      setBuyAmount,
      setMessage,
      setTransferRecipient,
      setTransferCoinAmount,
      setTransferCoinRate,
      setTransferNote,
      fetchTransfers,
      handleBuyCoins,
      handleUnlockCoins,
      handleCreateTransfer,
      handleApproveTransfer,
      handleRejectTransfer,
    },
  } = useCoinOrchestrator();

  const coinBalance = Number(coinInfo?.coin_balance ?? 0);
  const coinPriceBDT = Number(coinInfo?.coin_price ?? 120);

  // Universal Skeleton View if reviewer toggled or initial loading without cache
  if (isSkeletonReviewMode || (loading && !coinInfo)) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
        <CoinsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-900 pb-16 animate-fade-in select-none">
      {/* 1. Compact, Clearly Structured Page Header (sitting directly on background) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
            Solana P2P Exchange &amp; Hub
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Solana (SOL) &amp; P2P Coin Hub
          </h1>

          <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
            Trade, hold, and transfer Solana coins with custom exchange rates and real-time liquidity.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#009F6B]" />
              Status:{' '}
              <strong className="text-slate-900 font-semibold">Active SOL Hub</strong>
              <span className="text-slate-400">•</span>
              <span>Rate: 1 SOL = ৳{coinPriceBDT.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Secondary Actions with Liquid Glassmorphism */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Wallet className="w-3.5 h-3.5 text-[#009F6B]" />
            <span>Cash Wallet</span>
          </Link>

          <Link
            href="/dashboard/premium"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Membership</span>
          </Link>
        </div>
      </div>

      {/* Global alert feedback */}
      {message && (
        <AlertBanner
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* 2. KPI Summary Cards (Max 2 Content Rule: Top Label + Icon, Bottom Value) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Solana Balance */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">SOL Balance</span>
            <Coins className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {coinBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </span>
        </div>

        {/* Box 2: Portfolio BDT Value */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Portfolio Value</span>
            <span className="text-sm font-bold text-[#009F6B]">৳</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
            ৳{(coinBalance * coinPriceBDT).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Box 3: Market Rate */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Market Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
            ৳{coinPriceBDT.toFixed(2)}
          </span>
        </div>

        {/* Box 4: Pending Incoming Transfers */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Incoming Requests</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
            {pendingTransfers.length}
          </span>
        </div>
      </div>

      {/* 3. Navigation Controls: Segmented Pills on Desktop, Select Dropdown on Mobile */}
      <div className="flex items-center justify-between gap-4">
        {/* Desktop segmented controls */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/75 backdrop-blur-xl p-1.5 rounded-2xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)]">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#009F6B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            Overview &amp; Buy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRANSFER')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TRANSFER'
                ? 'bg-[#009F6B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('INCOMING')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'INCOMING'
                ? 'bg-[#009F6B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Incoming</span>
            {pendingTransfers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingTransfers.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-[#009F6B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* Mobile dropdown selector (44px touch target) */}
        <div className="relative w-full sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full min-h-[44px] appearance-none bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl px-4 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="OVERVIEW">Overview &amp; Buy SOL</option>
            <option value="TRANSFER">Send P2P Transfer</option>
            <option value="INCOMING">Incoming Transfers ({pendingTransfers.length})</option>
            <option value="HISTORY">Transfer History</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Active Tab Content (All rendered inside Liquid Glass Cards) */}
      <div className="w-full">
        {/* TAB 1: OVERVIEW & BUY */}
        {activeTab === 'OVERVIEW' && (
          <CoinOverviewTab
            coinInfo={coinInfo}
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            purchasing={purchasing}
            unlocking={unlocking}
            handleBuyCoins={handleBuyCoins}
            handleUnlockCoins={handleUnlockCoins}
          />
        )}

        {/* TAB 2: P2P TRANSFER */}
        {activeTab === 'TRANSFER' && (
          <CoinTransferForm
            transferRecipient={transferRecipient}
            setTransferRecipient={setTransferRecipient}
            transferCoinAmount={transferCoinAmount}
            setTransferCoinAmount={setTransferCoinAmount}
            transferCoinRate={transferCoinRate}
            setTransferCoinRate={setTransferCoinRate}
            transferNote={transferNote}
            setTransferNote={setTransferNote}
            coinBalance={coinBalance}
            coinPriceBDT={coinPriceBDT}
            transferring={transferring}
            onSubmit={handleCreateTransfer}
          />
        )}

        {/* TAB 3: INCOMING TRANSFERS */}
        {activeTab === 'INCOMING' && (
          <CoinIncomingTransfers
            pendingTransfers={pendingTransfers}
            loadingTransfers={loadingTransfers}
            approvingId={approvingId}
            rejectingId={rejectingId}
            onApprove={handleApproveTransfer}
            onReject={handleRejectTransfer}
            onRefresh={fetchTransfers}
          />
        )}

        {/* TAB 4: TRANSFER HISTORY */}
        {activeTab === 'HISTORY' && (
          <CoinHistoryTab
            transferHistory={transferHistory}
            loadingTransfers={loadingTransfers}
            onRefresh={fetchTransfers}
          />
        )}
      </div>
    </div>
  );
}
