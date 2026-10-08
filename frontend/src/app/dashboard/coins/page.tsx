'use client';

import React from 'react';
import { Send, Inbox, History, RefreshCw } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useCoinOrchestrator } from '../../../hooks/orchestrators';
import {
  CoinOverviewTab,
  CoinTransferForm,
  CoinIncomingTransfers,
  CoinHistoryTab,
} from '../../../components/coins';

export default function UserCoinsPage() {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-900 pb-16">
      {/* Top Bar / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Solana (SOL) & P2P Coin Hub
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Trade, hold, and transfer Solana coins with custom exchange rates
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#005A36] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Buy
          </button>
          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'TRANSFER'
                ? 'bg-[#005A36] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Transfer</span>
          </button>
          <button
            onClick={() => setActiveTab('INCOMING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'INCOMING'
                ? 'bg-[#005A36] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Incoming</span>
            {pendingTransfers.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingTransfers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'HISTORY'
                ? 'bg-[#005A36] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
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

      {/* TAB 3: INCOMING REQUESTS */}
      {activeTab === 'INCOMING' && (
        <CoinIncomingTransfers
          pendingTransfers={pendingTransfers}
          loadingTransfers={loadingTransfers}
          approvingId={approvingId}
          rejectingId={rejectingId}
          onRefresh={fetchTransfers}
          onApprove={handleApproveTransfer}
          onReject={handleRejectTransfer}
        />
      )}

      {/* TAB 4: TRANSFER HISTORY */}
      {activeTab === 'HISTORY' && (
        <CoinHistoryTab
          transferHistory={transferHistory}
          loadingTransfers={loadingTransfers}
          currentUserId={user?.id}
          onRefresh={fetchTransfers}
        />
      )}
    </div>
  );
}
