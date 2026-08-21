'use client';

import React from 'react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { WalletHeroBanner } from '../../../components/wallet/WalletHeroBanner';
import { WalletTransferModal } from '../../../components/wallet/WalletTransferModal';
import { WalletWithdrawModal } from '../../../components/wallet/WalletWithdrawModal';
import { WalletAuditTable } from '../../../components/wallet/WalletAuditTable';
import { useWalletPage } from '../../../hooks/useWalletPage';

export default function WalletPage() {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {statusMsg && (
        <AlertBanner
          type={statusMsg.type}
          message={statusMsg.text}
          onClose={() => setStatusMsg(null)}
        />
      )}

      {/* Full-Width Luxury Hero Wallet Banner */}
      <WalletHeroBanner
        currentBal={currentBal}
        showTransferModal={showTransferModal}
        showWithdrawModal={showWithdrawModal}
        onToggleTransfer={() => {
          setShowTransferModal((prev) => !prev);
          setShowWithdrawModal(false);
          setAuditFilter('BALANCE_TRANSFER');
        }}
        onToggleWithdraw={() => {
          setShowWithdrawModal((prev) => !prev);
          setShowTransferModal(false);
          setAuditFilter('WITHDRAW');
        }}
      />

      {/* Network Transfer Modal / Form */}
      {showTransferModal && (
        <WalletTransferModal
          currentBal={currentBal}
          targetReferralCode={targetReferralCode}
          setTargetReferralCode={setTargetReferralCode}
          recipientName={recipientName}
          recipientPhone={recipientPhone}
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

      {/* Transaction Audit History Table */}
      <WalletAuditTable
        transactions={filteredTransactions}
        loading={loading}
        auditFilter={auditFilter}
        onFilterChange={setAuditFilter}
      />
    </div>
  );
}
