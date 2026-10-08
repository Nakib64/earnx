'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { usePurchaseOrchestrator } from '../../../hooks/orchestrators';
import {
  PurchaseTargetSection,
  PurchasePackageSection,
  PurchaseReferrerSection,
  PurchaseModal,
} from '../../../components/purchase';

export default function PurchasePage() {
  const {
    state: {
      packageType,
      selectedPlanId,
      activePlans,
      loadingPlans,
      targetQuery,
      targetResults,
      searchingTarget,
      selectedTargetUser,
      showTargetDropdown,
      referrerQuery,
      referrerResults,
      searchingReferrer,
      selectedReferrerUser,
      showReferrerDropdown,
      submitting,
      modalState,
      activationFee,
      premiumFee,
    },
    computed: {
      currentPrice,
      payerBalance,
    },
    actions: {
      setPackageType,
      setSelectedPlanId,
      setTargetQuery,
      setSelectedTargetUser,
      setShowTargetDropdown,
      setReferrerQuery,
      setSelectedReferrerUser,
      setShowReferrerDropdown,
      setModalState,
      handleSelectTargetUser,
      handleSelectSelfAsTarget,
      handleSelectReferrerUser,
      handleSelectSelfAsReferrer,
      handleSelectTargetSponsorAsReferrer,
      handleInitiatePurchase,
      handleExecutePurchase,
    },
  } = usePurchaseOrchestrator();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Purchase Form</h1>
          <p className="text-xs text-slate-300 font-medium">
            Buy Account Activation, Premium Subscription, or Investment Plans using account balance.
          </p>
        </div>
        <div className="bg-[#023322] border border-[#d4af37]/40 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-300">
          Balance: <strong className="text-white">৳{payerBalance.toFixed(2)}</strong>
        </div>
      </div>

      {/* Main Generic Form */}
      <form
        onSubmit={handleInitiatePurchase}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
      >
        {/* 1. Target User Section */}
        <PurchaseTargetSection
          targetQuery={targetQuery}
          setTargetQuery={setTargetQuery}
          targetResults={targetResults}
          searchingTarget={searchingTarget}
          selectedTargetUser={selectedTargetUser}
          setSelectedTargetUser={setSelectedTargetUser}
          showTargetDropdown={showTargetDropdown}
          setShowTargetDropdown={setShowTargetDropdown}
          onSelectTargetUser={handleSelectTargetUser}
          onSelectSelfAsTarget={handleSelectSelfAsTarget}
        />

        {/* 2. Package & Investment Plans Section */}
        <PurchasePackageSection
          packageType={packageType}
          setPackageType={setPackageType}
          activationFee={activationFee}
          premiumFee={premiumFee}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
          activePlans={activePlans}
          loadingPlans={loadingPlans}
        />

        {/* 3. Referrer Section (only for PREMIUM) */}
        <PurchaseReferrerSection
          packageType={packageType}
          selectedTargetUser={selectedTargetUser}
          referrerQuery={referrerQuery}
          setReferrerQuery={setReferrerQuery}
          referrerResults={referrerResults}
          searchingReferrer={searchingReferrer}
          selectedReferrerUser={selectedReferrerUser}
          setSelectedReferrerUser={setSelectedReferrerUser}
          showReferrerDropdown={showReferrerDropdown}
          setShowReferrerDropdown={setShowReferrerDropdown}
          onSelectReferrerUser={handleSelectReferrerUser}
          onSelectSelfAsReferrer={handleSelectSelfAsReferrer}
          onSelectTargetSponsorAsReferrer={handleSelectTargetSponsorAsReferrer}
        />

        {/* Total Cost & Submit */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-slate-500 block font-medium">Total Package Fee:</span>
            <span className="text-xl font-black font-mono text-[#005A36]">৳{currentPrice.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-[#005A36] hover:bg-[#044D2F] text-white px-8 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-colors cursor-pointer"
          >
            <span>Buy Package Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Confirmation & Status Modal */}
      <PurchaseModal
        modalState={modalState}
        submitting={submitting}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecutePurchase}
      />
    </div>
  );
}
