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

export function usePremiumOrchestrator() {
  const { user, refreshUserProfile } = useAuth();
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [dailyTask, setDailyTask] = useState<DailyTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ad player modal state
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(10);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [recordingAd, setRecordingAd] = useState(false);

  // Claiming reward state
  const [claiming, setClaiming] = useState(false);

  // Subscribe modal state
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PremiumPackage | null>(null);

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

  // Handle countdown when ad modal is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (adModalOpen && adPlaying && adCountdown > 0) {
      interval = setInterval(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    } else if (adCountdown === 0 && adPlaying) {
      setAdPlaying(false);
      setAdCompleted(true);
    }
    return () => clearInterval(interval);
  }, [adModalOpen, adPlaying, adCountdown]);

  const handleStartWatchAd = () => {
    setAdModalOpen(true);
    setAdCountdown(8);
    setAdPlaying(true);
    setAdCompleted(false);
  };

  const handleFinishAd = async () => {
    setRecordingAd(true);
    const res = await apiFetch<any>('/premium/watch-ad', { method: 'POST' });
    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: res.data?.message || 'Ad viewed! Reward added to your wallet.',
      });
      setAdModalOpen(false);
      await Promise.all([fetchPackagesAndTask(), refreshUserProfile()]);
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to record ad view.' });
    }
    setRecordingAd(false);
  };


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
    setSelectedPkgForModal(pkg);
  };

  const handleCloseSubscribeModal = () => {
    if (subscribingId) return;
    setSelectedPkgForModal(null);
  };

  const handleConfirmSubscribe = async (pkg: PremiumPackage, referrerCode?: string) => {
    setSubscribingId(pkg.id);
    const res = await apiFetch('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        package_id: pkg.id,
        referrer_code: referrerCode?.trim() || 'earnx-123',
      }),
    });

    if (res.success) {
      setSelectedPkgForModal(null);
      setAlertMsg({
        type: 'success',
        text: `🎉 Upgraded to ${pkg.title}! You can now watch daily ads to claim your daily rewards.`,
      });
      await refreshUserProfile();
      await fetchPackagesAndTask();
    } else {
      setAlertMsg({
        type: 'error',
        text: res.error?.message || 'Failed to subscribe to package.',
      });
    }
    setSubscribingId(null);
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
    },
    computed: {
      user,
      isUserPremium: !!user?.is_premium,
    },
    actions: {
      setAlertMsg,
      setAdModalOpen,
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
