'use client';

import React from 'react';
import { Crown, RefreshCw } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { usePremiumOrchestrator } from '../../../hooks/orchestrators';
import {
  PremiumDailyTaskCard,
  PremiumPackagesGrid,
  PremiumAdModal,
} from '../../../components/premium';

export default function PremiumDashboardPage() {
  const {
    state: {
      packages,
      dailyTask,
      loading,
      subscribingId,
      alertMsg,
      adModalOpen,
      adCountdown,
      adCompleted,
      recordingAd,
      claiming,
    },
    computed: { user },
    actions: {
      setAlertMsg,
      handleStartWatchAd,
      handleFinishAd,
      handleClaimReward,
      handleSubscribe,
      fetchPackagesAndTask,
    },
  } = usePremiumOrchestrator();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-900 p-6 sm:p-8 text-white shadow-xl shadow-amber-950/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-black uppercase tracking-wider text-amber-200 border border-white/20">
              <Crown className="w-3.5 h-3.5" />
              VIP Watch & Earn Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Premium Memberships & Daily Ad Rewards
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm font-medium max-w-xl">
              Watch daily sponsored ads to collect guaranteed cash rewards directly to your wallet every single day.
            </p>
          </div>
          <button
            onClick={fetchPackagesAndTask}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Daily Watch-to-Earn Ads Section */}
      <PremiumDailyTaskCard
        dailyTask={dailyTask}
        claiming={claiming}
        onClaim={handleClaimReward}
        onStartWatchAd={handleStartWatchAd}
      />

      {/* Packages Showcase */}
      <PremiumPackagesGrid
        packages={packages}
        loading={loading}
        subscribingId={subscribingId}
        currentPackageId={user?.premium_package?.id}
        onSubscribe={handleSubscribe}
      />

      {/* Ad Player Modal */}
      <PremiumAdModal
        isOpen={adModalOpen}
        adCountdown={adCountdown}
        adCompleted={adCompleted}
        recordingAd={recordingAd}
        onFinishAd={handleFinishAd}
      />
    </div>
  );
}
