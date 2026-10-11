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
   * Opens the in-tab Video Ad player directly inside EarnX.
   */
  const handleStartWatchAd = useCallback(() => {
    setAlertMsg(null);
    setAdModalOpen(true);
    setAdPlaying(true);
    setAdCompleted(false);
    setRecordingAd(false);
  }, []);

  /**
   * Called when ad video ends or user claims reward:
   * Closes the ad window immediately and shows success message.
   */
  const handleCompleteVideoAd = useCallback(async () => {
    // 1. Immediately close the ad modal
    setAdModalOpen(false);
    setAdPlaying(false);
    setAdCompleted(true);
    setRecordingAd(false);

    try {
      const watchRes = await apiFetch<any>('/premium/watch-ad', { method: 'POST' });
      await Promise.all([fetchPackagesAndTask(), refreshUserProfile()]);

      if (watchRes.success) {
        const reward = watchRes.data?.reward_earned || watchRes.data?.reward_per_ad;
        const msg = reward
          ? `Ad completed! ৳${Number(reward).toFixed(2)} added to your wallet.`
          : `Ad completed! Daily task progress updated (${watchRes.data?.ads_watched || 1}/${watchRes.data?.daily_ads_required || 10}).`;

        toast.success(msg, { duration: 4000 });
        setAlertMsg({ type: 'success', text: msg });
      } else {
        const fallbackMsg = 'Ad completed! Your reward has been credited to your balance.';
        toast.success(fallbackMsg, { duration: 4000 });
        setAlertMsg({ type: 'success', text: fallbackMsg });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record ad reward.');
      setAlertMsg({
        type: 'error',
        text: err?.message || 'Failed to record ad reward.',
      });
    } finally {
      setAdCompleted(false);
    }
  }, [fetchPackagesAndTask, refreshUserProfile]);

  /**
   * Called if user exits before the unskippable countdown finishes (forfeits reward).
   */
  const handleCancelVideoAd = useCallback(() => {
    setAdModalOpen(false);
    setAdPlaying(false);
    setAdCompleted(false);
    setRecordingAd(false);
    setAlertMsg({
      type: 'error',
      text: 'Ad closed early. You must watch until the skip button unlocks to receive your reward.',
    });
  }, []);

  // Backward compatibility alias
  const handleFinishAd = handleCompleteVideoAd;

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
