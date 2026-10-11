'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { PremiumPackage } from '../../types';

export interface DailyTaskData {
  is_premium: boolean;
  package_title?: string;
  daily_reward_amount?: number;
  daily_ads_required?: number;
  ads_watched?: number;
  reward_per_ad?: number;
  earned_today?: number;
  remaining_ads?: number;
  remaining_reward?: number;
  quota_reached?: boolean;
  is_claimed?: boolean;
  can_claim?: boolean;
  claim_date?: string;
  message?: string;
}

// Monetag global type declarations
declare global {
  interface Window {
    show_monetag_rewarded?: (zoneId: string) => Promise<void>;
  }
}

export function usePremiumOrchestrator() {
  const { user, refreshUserProfile } = useAuth();
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [dailyTask, setDailyTask] = useState<DailyTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ad player state — now tracks Monetag SDK state rather than simulated timer
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);  // kept for UI compatibility
  const [adPlaying, setAdPlaying] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [recordingAd, setRecordingAd] = useState(false);

  // Claiming reward state
  const [claiming, setClaiming] = useState(false);

  // Subscribe modal state
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PremiumPackage | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const fetchPackagesAndTask = useCallback(async () => {
    if (packages.length === 0) {
      setLoading(true);
    }
    const [pkgRes, taskRes] = await Promise.all([
      apiFetch<PremiumPackage[]>('/premium/packages'),
      apiFetch<DailyTaskData>('/premium/daily-task'),
    ]);

    if (pkgRes.success && pkgRes.data) {
      setPackages(pkgRes.data);
    }
    if (taskRes.success && taskRes.data) {
      setDailyTask(taskRes.data);
    }
    setLoading(false);
  }, [packages.length]);

  useEffect(() => {
    fetchPackagesAndTask();
  }, [fetchPackagesAndTask]);

  /**
   * Launches Monetag Rewarded Interstitial via their SDK.
   *
   * S2S Flow:
   * 1. We fetch a signed HMAC token from our backend (GET /api/ads/monetag-init).
   * 2. We call Monetag's SDK function, passing our zone ID.
   * 3. Monetag shows the real ad and controls the countdown themselves.
   * 4. Once the user finishes the ad, Monetag's servers call our postback endpoint:
   *    GET /api/ads/monetag-postback?uid={userId}&token={hmac}
   * 5. Our backend verifies the HMAC and credits the reward automatically.
   * 6. We then refresh the daily task status to show updated counts.
   *
   * NOTE: While waiting for S2S postback, we show a "Verifying..." state.
   * If the SDK Promise resolves, we do a short refresh poll to pick up the credit.
   */
  const handleStartWatchAd = useCallback(async () => {
    setAlertMsg(null);

    // Fetch signed token + Zone ID from backend
    const initRes = await apiFetch<{ user_id: string; token: string; zone_id: string }>('/ads/monetag-init');
    if (!initRes.success || !initRes.data) {
      setAlertMsg({ type: 'error', text: 'Could not initialize ad. Please try again.' });
      return;
    }

    const { zone_id } = initRes.data;

    // Check if Monetag SDK is loaded (injected via next/script in layout)
    if (typeof window === 'undefined' || typeof window.show_monetag_rewarded !== 'function') {
      setAlertMsg({
        type: 'error',
        text: 'Ad network is not ready yet. Please wait a moment and try again.',
      });
      return;
    }

    setAdModalOpen(true);
    setAdPlaying(true);
    setAdCompleted(false);

    try {
      // This call blocks until Monetag finishes the full ad (they control the timer)
      await window.show_monetag_rewarded(zone_id);

      // Monetag SDK resolved — means user completed the ad on the client side.
      // The S2S postback is already being processed by Monetag's servers.
      // We show a brief "verifying" state while S2S credits the wallet.
      setAdPlaying(false);
      setAdCompleted(true);
      setRecordingAd(true);

      // Give S2S postback ~2 seconds to process, then refresh
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.all([fetchPackagesAndTask(), refreshUserProfile()]);

      setAlertMsg({
        type: 'success',
        text: 'Ad verified and reward credited to your wallet!',
      });
    } catch (err: any) {
      // User closed the ad early, or ad failed to load
      setAlertMsg({ type: 'error', text: 'Ad was not completed. Please try again.' });
    } finally {
      setAdModalOpen(false);
      setAdPlaying(false);
      setAdCompleted(false);
      setRecordingAd(false);
    }
  }, [fetchPackagesAndTask, refreshUserProfile]);

  // Keep handleFinishAd for PremiumAdModal backward compatibility
  const handleFinishAd = useCallback(async () => {
    // With S2S, completion is already handled — this is a no-op safety valve
    setAdModalOpen(false);
    setAdPlaying(false);
    setAdCompleted(false);
    setRecordingAd(false);
  }, []);

  const handleClaimReward = async () => {
    setClaiming(true);
    const res = await apiFetch<any>('/premium/claim-daily-reward', { method: 'POST' });
    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: `Congratulations! ৳${res.data?.reward_amount || 'reward'} credited to your wallet!`,
      });
      fetchPackagesAndTask();
      refreshUserProfile();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to claim daily reward.' });
    }
    setClaiming(false);
  };

  const handleOpenSubscribeModal = (pkg: PremiumPackage) => {
    setSubscribeError(null);
    setSelectedPkgForModal(pkg);
  };

  const handleCloseSubscribeModal = () => {
    if (subscribingId) return;
    setSubscribeError(null);
    setSelectedPkgForModal(null);
  };

  const handleConfirmSubscribe = async (
    pkg: PremiumPackage,
    referrerCode?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setSubscribingId(pkg.id);
    setSubscribeError(null);
    const res = await apiFetch('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        package_id: pkg.id,
        referrer_code: referrerCode?.trim() || 'earnx-123',
      }),
    });

    if (res.success) {
      setSelectedPkgForModal(null);
      setSubscribeError(null);
      setAlertMsg({
        type: 'success',
        text: `🎉 Upgraded to ${pkg.title}! You can now watch daily ads to claim your daily rewards.`,
      });
      await refreshUserProfile();
      await fetchPackagesAndTask();
      setSubscribingId(null);
      return { success: true };
    } else {
      const errorMsg = res.error?.message || 'Failed to subscribe to package.';
      setSubscribeError(errorMsg);
      setAlertMsg({
        type: 'error',
        text: errorMsg,
      });
      setSubscribingId(null);
      return { success: false, error: errorMsg };
    }
  };

  return {
    state: {
      packages,
      dailyTask,
      loading,
      subscribingId,
      alertMsg,
      adModalOpen,
      adCountdown,
      adPlaying,
      adCompleted,
      recordingAd,
      claiming,
      selectedPkgForModal,
      subscribeError,
    },
    computed: {
      user,
      isPremium: user?.is_premium || false,
    },
    actions: {
      setAlertMsg,
      handleStartWatchAd,
      handleFinishAd,
      handleClaimReward,
      handleOpenSubscribeModal,
      handleCloseSubscribeModal,
      handleConfirmSubscribe,
      fetchPackagesAndTask,
    },
  };
}
