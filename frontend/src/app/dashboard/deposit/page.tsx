'use client';

import React from 'react';
import { RefreshCw, ArrowDownCircle } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useDepositOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import {
  DepositGatewaySelector,
  DepositSubmitForm,
  DepositHistoryTable,
  DepositSkeleton,
} from '../../../components/deposit';
import { GlassCard, GlassButton } from '../../../components/design-system';

export default function UserDepositPage() {
  const { isLoading: isSkeletonReviewMode } = useDesignSystem();
  const {
    state: {
      gateways,
      deposits,
      loadingHistory,
      submitting,
      selectedMethod,
      senderNumber,
      amount,
      trxId,
      copiedKey,
      alertMsg,
    },
    actions: {
      setSelectedMethod,
      setSenderNumber,
      setAmount,
      setTrxId,
      setAlertMsg,
      handleCopy,
      handleSubmit,
      getMethodInfo,
      fetchGateways,
      fetchHistory,
    },
  } = useDepositOrchestrator();

  if (isSkeletonReviewMode || (loadingHistory && deposits.length === 0)) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-5 lg:p-8 font-sans pb-16">
        <DepositSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-5 lg:p-8 font-sans text-slate-900 pb-16">
      {/* Liquid Glass Hero Header */}
      <GlassCard
        variant="elevated"
        className="p-6 sm:p-8 text-slate-900 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              Instant Manual Deposit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 ">
            Deposit Funds
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">
            Top up your EarnX main balance easily using bKash, Nagad, or Rocket.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <GlassButton
            onClick={() => {
              fetchGateways();
              fetchHistory();
            }}
            variant="secondary"
            size="md"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </GlassButton>
        </div>
      </GlassCard>

      {alertMsg && (
        <AlertBanner
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg(null)}
        />
      )}

      {/* Grid: Gateways & Deposit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Gateway Numbers & Steps (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <DepositGatewaySelector
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            getMethodInfo={getMethodInfo}
            copiedKey={copiedKey}
            handleCopy={handleCopy}
            instruction={gateways?.deposit_instruction}
          />
        </div>

        {/* Right Col: Submission Form (7 cols) */}
        <div className="lg:col-span-7">
          <DepositSubmitForm
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            senderNumber={senderNumber}
            setSenderNumber={setSenderNumber}
            amount={amount}
            setAmount={setAmount}
            trxId={trxId}
            setTrxId={setTrxId}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Full-Width Deposit History Table */}
      <DepositHistoryTable
        deposits={deposits}
        loadingHistory={loadingHistory}
        onRefresh={fetchHistory}
      />
    </div>
  );
}
