'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowRightLeft,
  MinusCircle,
  History,
  Crown,
  ArrowDownCircle,
} from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  WalletHeroBanner,
  WalletTransferModal,
  WalletWithdrawModal,
  WalletAuditTable,
  WalletSkeleton,
} from '../../../components/wallet';
import { useWalletPage } from '../../../hooks/useWalletPage';
import { useDesignSystem } from '../../../context/DesignSystemContext';

export default function WalletPage() {
  const { isLoading: isSkeletonReviewMode } = useDesignSystem();
  const {
    currentBal,
    filteredTransactions,
    loading,
    auditFilter,
    setAuditFilter,
    statusMsg,
    setStatusMsg,

    // Modal toggles
    showWithdrawModal,
    setShowWithdrawModal,
    showTransferModal,
    setShowTransferModal,

    // Withdrawal
    withdrawAmount,
    setWithdrawAmount,
    submittingWithdraw,
    handleWithdrawalSubmit,

    // Transfer
    targetReferralCode,
    setTargetReferralCode,
    recipientName,
    recipientPhone,
    recipientEmail,
    transferAmount,
    setTransferAmount,
    transferNote,
    setTransferNote,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    searchingRecipient,
    verifiedRecipient,
    recipientError,
    submittingTransfer,
    dropdownRef,
    selectRecipient,
    handleTransferSubmit,
  } = useWalletPage();

  if (isSkeletonReviewMode || (loading && filteredTransactions.length === 0)) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
        <WalletSkeleton />
      </div>
    );
  }

  const transferCount = filteredTransactions.filter(
    (tx) => tx.type?.includes('TRANSFER'),
  ).length;
  const withdrawCount = filteredTransactions.filter(
    (tx) => tx.type?.includes('WITHDRAW'),
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-900 pb-16 animate-fade-in select-none">
      {/* 1. Compact, Clearly Structured Page Header (sitting directly on background) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
            Cash Wallet &amp;
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Cash Wallet &amp; Transaction
          </h1>

          <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
            Manage your liquid balance, perform instant peer-to-peer transfers, request cash withdrawals, and audit history.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#009F6B]" />
              Status:{' '}
              <strong className="text-slate-900 font-semibold">Active Cash Account</strong>
            </span>
          </div>
        </div>

        {/* Secondary Actions with Liquid Glassmorphism */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Link
            href="/dashboard/deposit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-[#009F6B]" />
            <span>Deposit</span>
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
      {statusMsg && (
        <AlertBanner
          type={statusMsg.type}
          message={statusMsg.text}
          onClose={() => setStatusMsg(null)}
        />
      )}

      {/* 2. KPI Summary Cards (Max 2 Content Rule: Top Label + Icon, Bottom Value) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Available Balance */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Balance</span>
            <Wallet className="w-4 h-4 text-[#009F6B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            ৳{Number(currentBal || 0).toLocaleString()}
          </span>
        </div>

        {/* Box 2: Total  Logs */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Entries</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
            {filteredTransactions.length}
          </span>
        </div>

        {/* Box 3: P2P Transfers */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">P2P Transfers</span>
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
            {transferCount}
          </span>
        </div>

        {/* Box 4: Withdrawals */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Withdrawals</span>
            <MinusCircle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
            {withdrawCount}
          </span>
        </div>
      </div>

      {/* 3. Quick Action Buttons Bar (Liquid Glass) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Wallet Operations
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Transfer funds to network peers or request cash out to your mobile wallet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowTransferModal((prev) => !prev);
              setShowWithdrawModal(false);
              setAuditFilter('BALANCE_TRANSFER');
            }}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${showTransferModal
                ? 'bg-slate-900 text-white'
                : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90'
              }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Balance Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowWithdrawModal((prev) => !prev);
              setShowTransferModal(false);
              setAuditFilter('WITHDRAW');
            }}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${showWithdrawModal
                ? 'bg-[#009F6B] text-white'
                : 'bg-[#009F6B] hover:bg-[#008C5F] text-white'
              }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Network Transfer Modal / Form */}
      {showTransferModal && (
        <WalletTransferModal
          currentBal={currentBal}
          targetReferralCode={targetReferralCode}
          setTargetReferralCode={setTargetReferralCode}
          recipientName={recipientName}
          recipientPhone={recipientPhone}
          recipientEmail={recipientEmail}
          transferAmount={transferAmount}
          setTransferAmount={setTransferAmount}
          transferNote={transferNote}
          setTransferNote={setTransferNote}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          searchingRecipient={searchingRecipient}
          verifiedRecipient={verifiedRecipient}
          recipientError={recipientError}
          submittingTransfer={submittingTransfer}
          dropdownRef={dropdownRef}
          onSelectRecipient={selectRecipient}
          onSubmit={handleTransferSubmit}
          onCancel={() => setShowTransferModal(false)}
        />
      )}

      {/* Withdrawal Form Modal / Box */}
      {showWithdrawModal && (
        <WalletWithdrawModal
          currentBal={currentBal}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          submittingWithdraw={submittingWithdraw}
          onSubmit={handleWithdrawalSubmit}
          onCancel={() => setShowWithdrawModal(false)}
        />
      )}

      {/* 4. Transaction Audit History Table in Liquid Glass */}
        <WalletAuditTable
          transactions={filteredTransactions}
          loading={loading && filteredTransactions.length === 0}
          auditFilter={auditFilter}
          onFilterChange={setAuditFilter}
        />
    </div>
  );
}
