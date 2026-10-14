'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
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

export function usePremiumOrchestrator() {
  const { user, refreshUserProfile } = useAuth();
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [dailyTask, setDailyTask] = useState<DailyTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ad player state
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [recordingAd, setRecordingAd] = useState(false);
  const [adRewardEarned, setAdRewardEarned] = useState<number>(0);

  // Claiming reward state
  const [claiming, setClaiming] = useState(false);

  // Subscribe modal state
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PremiumPackage | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const fetchPackagesAndTask = useCallback(async (opts?: { forceRefresh?: boolean; skipCache?: boolean }) => {
    if (packages.length === 0) {
      setLoading(true);
    }
    const isRefresh = opts?.forceRefresh || opts?.skipCache;
    const fetchOptions = isRefresh ? { skipCache: true, forceRefresh: true } : {};

    const [pkgRes, taskRes] = await Promise.all([
      apiFetch<PremiumPackage[]>('/premium/packages', fetchOptions),
      apiFetch<DailyTaskData>('/premium/daily-task', fetchOptions),
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
   * Opens the in-tab Video Ad player directly inside EarnX.
   */
  const handleStartWatchAd = useCallback(() => {
    setAlertMsg(null);
    setAdModalOpen(true);
    setAdPlaying(true);
    setAdCompleted(false);
    setRecordingAd(false);
    setAdRewardEarned(0);
  }, []);

  /**
   * Called when ad video ends or user claims reward:
   * Keeps modal OPEN with a screen-blocking loading overlay until
   * the backend records the ad view and updates UI, then shows celebratory state.
   */
  const handleCompleteVideoAd = useCallback(async () => {
    // 1. Immediately activate screen-blocking loading state (do NOT close modal!)
    setRecordingAd(true);
    setAdPlaying(false);
    setAdCompleted(false);

    try {
      const watchRes = await apiFetch<any>('/premium/watch-ad', {
        method: 'POST',
        skipCache: true,
      });

      if (watchRes.success && watchRes.data) {
        const data = watchRes.data;
        const reward = Number(
          data.reward_earned || data.earned_now || data.reward_per_ad || dailyTask?.reward_per_ad || 0,
        );
        const watched = Number(data.ads_watched ?? ((dailyTask?.ads_watched || 0) + 1));
        const required = Number(data.daily_ads_required ?? (dailyTask?.daily_ads_required || 30));
        const earnedToday = Number(data.earned_today ?? ((dailyTask?.earned_today || 0) + reward));
        const quotaReached = Boolean(data.quota_reached ?? (watched >= required));

        setAdRewardEarned(reward);

        // 2. Direct instant UI state update for zero lag on progressbar and metrics
        setDailyTask((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ads_watched: watched,
            daily_ads_required: required,
            earned_today: earnedToday,
            remaining_ads: Math.max(0, required - watched),
            remaining_reward: Math.max(
              0,
              Number(((prev.daily_reward_amount || 0) - earnedToday).toFixed(2)),
            ),
            quota_reached: quotaReached,
            is_claimed: quotaReached,
          };
        });

        // 3. Concurrently sync fresh database task state & user wallet balance
        await Promise.allSettled([
          fetchPackagesAndTask({ forceRefresh: true, skipCache: true }),
          refreshUserProfile(),
        ]);

        // 4. Switch from loading spinner to celebration checkmark state
        setRecordingAd(false);
        setAdCompleted(true);

        const msg = reward > 0
          ? `Ad completed! ৳${reward.toFixed(2)} added to your wallet.`
          : `Ad completed! Daily task progress updated (${watched}/${required}).`;

        // 5. Keep screen-blocking celebration visible so user sees the reward confirmation
        await new Promise((resolve) => setTimeout(resolve, 1300));

        // 6. Smoothly dismiss modal & clear celebration state
        setAdModalOpen(false);
        setAdCompleted(false);

        // 7. Show success feedback on page
        toast.success(msg, { duration: 4000 });
        setAlertMsg({ type: 'success', text: msg });
      } else {
        // Backend returned an error response
        const errorMsg = watchRes.error?.message || 'Failed to record ad reward.';

        // Background sync to ensure client reflects latest DB state
        await fetchPackagesAndTask({ forceRefresh: true, skipCache: true });

        setRecordingAd(false);
        setAdModalOpen(false);
        setAdCompleted(false);

        toast.error(errorMsg, { duration: 5000 });
        setAlertMsg({ type: 'error', text: errorMsg });
      }
    } catch (err: any) {
      setRecordingAd(false);
      setAdModalOpen(false);
      setAdCompleted(false);

      const errorMsg = err?.message || 'Failed to record ad reward.';
      toast.error(errorMsg, { duration: 5000 });
      setAlertMsg({ type: 'error', text: errorMsg });
    }
  }, [dailyTask, fetchPackagesAndTask, refreshUserProfile]);

  /**
   * Called if user exits before the unskippable countdown finishes (forfeits reward).
   */
  const handleCancelVideoAd = useCallback(() => {
    setAdModalOpen(false);
    setAdPlaying(false);
    setAdCompleted(false);
    setRecordingAd(false);
    setAdRewardEarned(0);
    setAlertMsg({
      type: 'error',
      text: 'Ad closed early. You must watch until the skip button unlocks to receive your reward.',
    });
  }, []);

  // Backward compatibility alias
  const handleFinishAd = handleCompleteVideoAd;

  const handleClaimReward = async () => {
    setClaiming(true);
    const res = await apiFetch<any>('/premium/claim-daily-reward', { method: 'POST', skipCache: true });
    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: `Congratulations! ৳${res.data?.reward_amount || 'reward'} credited to your wallet!`,
      });
      await fetchPackagesAndTask({ forceRefresh: true, skipCache: true });
      await refreshUserProfile();
    } else {
      toast.error(res.error?.message || 'Failed to claim reward');
    }
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
    referrerCode: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanRef = referrerCode?.trim();
    if (!cleanRef) {
      const errMsg = 'A valid sponsor referral code is mandatory to purchase a premium package.';
      setSubscribeError(errMsg);
      return { success: false, error: errMsg };
    }

    setSubscribingId(pkg.id);
    setSubscribeError(null);
    const res = await apiFetch('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        package_id: pkg.id,
        referrer_code: cleanRef,
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
      adRewardEarned,
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
      handleCompleteVideoAd,
      handleCancelVideoAd,
      handleClaimReward,
      handleOpenSubscribeModal,
      handleCloseSubscribeModal,
      handleConfirmSubscribe,
      fetchPackagesAndTask,
    },
  };
}
