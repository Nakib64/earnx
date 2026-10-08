'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useDepositOrchestrator } from '../../../hooks/orchestrators';
import {
  DepositGatewaySelector,
  DepositSubmitForm,
  DepositHistoryTable,
} from '../../../components/deposit';

export default function UserDepositPage() {
  const {
    state: {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#005A36] to-[#044D2F] p-6 rounded-3xl text-white shadow-xl shadow-emerald-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-emerald-100">
              Instant Manual Deposit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Deposit Funds</h1>
          <p className="text-emerald-100 text-xs sm:text-sm font-medium">
            Top up your EarnX main balance easily using bKash, Nagad, or Rocket.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchGateways();
              fetchHistory();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

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

      {/* Deposit History */}
      <DepositHistoryTable
        deposits={deposits}
        loadingHistory={loadingHistory}
        onRefresh={fetchHistory}
      />
    </div>
  );
}
