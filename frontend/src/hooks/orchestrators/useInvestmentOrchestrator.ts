'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { InvestmentPlan, UserInvestment, RequestStatus } from '../../types';

export function useInvestmentOrchestrator() {
  const { user, refreshUserProfile } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Flexible tenure and custom amount states
  const [customInvestAmount, setCustomInvestAmount] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(6);

  const fetchData = useCallback(async () => {
    if (plans.length === 0) {
      setLoading(true);
    }
    const [plansRes, myRes] = await Promise.all([
      apiFetch<InvestmentPlan[]>('/investments/plans'),
      apiFetch<UserInvestment[]>('/investments/my'),
    ]);
    if (plansRes.success && plansRes.data) setPlans(plansRes.data);
    if (myRes.success && myRes.data) setMyInvestments(myRes.data);
    setLoading(false);
  }, [plans.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Identify primary active or pending investment
  const activeInv = myInvestments.find(
    (inv) => inv.status === RequestStatus.APPROVED || inv.status === RequestStatus.PENDING,
  );

  const handleOpenInvestOrUpgrade = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setMessage(null);
    setCustomInvestAmount(String(plan.min_amount || plan.amount || 1000));
    setSelectedDuration((plan.duration_months as any) || 6);

    const targetAmt = Number(plan.amount || plan.min_amount);
    const currentAmt = activeInv ? Number(activeInv.amount) : 0;

    if (activeInv && targetAmt > currentAmt) {
      setShowUpgradeModal(true);
    } else {
      setShowUpgradeModal(false);
    }
  };

  // Handle New Investment Subscription
  const handleInvest = async () => {
    if (!selectedPlan) return;

    const investAmt =
      parseFloat(customInvestAmount) || Number(selectedPlan.amount || selectedPlan.min_amount);
    const minRequired = Number(selectedPlan.min_amount || selectedPlan.amount || 500);
    if (investAmt < minRequired) {
      setMessage({
        type: 'error',
        text: `Minimum investment amount for this plan is ৳${minRequired.toLocaleString()}.`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const res = await apiFetch<UserInvestment>('/investments/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        planId: selectedPlan.id,
        amount: investAmt,
        durationMonths: selectedDuration,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Investment activated! ৳${investAmt.toLocaleString()} has been locked in principal for ${selectedDuration} months.`,
      });
      setSelectedPlan(null);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to submit investment' });
    }
    setSubmitting(false);
  };

  // Handle Package Upgrade Request
  const handleUpgrade = async () => {
    if (!selectedPlan || !activeInv) return;
    setSubmitting(true);
    setMessage(null);

    const targetAmt = Number(selectedPlan.amount || selectedPlan.min_amount);
    const remainingToPay = targetAmt - Number(activeInv.amount);

    const res = await apiFetch<UserInvestment>('/investments/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        currentInvestmentId: activeInv.id,
        targetPlanId: selectedPlan.id,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Package upgraded to ${selectedPlan.title}! ৳${remainingToPay.toLocaleString()} has been deducted from your account balance.`,
      });
      setSelectedPlan(null);
      setShowUpgradeModal(false);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to submit upgrade' });
    }
    setSubmitting(false);
  };

  // Handle Capital Withdrawal
  const handleWithdraw = async (investmentId?: string) => {
    const targetId = investmentId || activeInv?.id;
    if (!targetId) return;

    setSubmitting(true);
    setMessage(null);

    const res = await apiFetch<UserInvestment>('/investments/withdraw-capital', {
      method: 'POST',
      body: JSON.stringify({
        investmentId: targetId,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: 'Invested capital successfully refunded and credited to your account balance!',
      });
      setShowWithdrawModal(false);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({
        type: 'error',
        text: res.error?.message || 'Failed to submit withdrawal request',
      });
    }
    setSubmitting(false);
  };

  const handleOpenWithdrawCapital = (inv: UserInvestment) => {
    setSelectedPlan(null);
    setShowUpgradeModal(false);
    setWithdrawAmount(Number(inv.amount));
    setShowWithdrawModal(true);
    setMessage(null);
  };

  return {
    state: {
      plans,
      myInvestments,
      loading,
      submitting,
      selectedPlan,
      showUpgradeModal,
      showWithdrawModal,
      withdrawAmount,
      message,
      customInvestAmount,
      selectedDuration,
    },
    computed: {
      user,
      activeInv,
    },
    actions: {
      setSelectedPlan,
      setShowUpgradeModal,
      setShowWithdrawModal,
      setWithdrawAmount,
      setMessage,
      setCustomInvestAmount,
      setSelectedDuration,
      handleOpenInvestOrUpgrade,
      handleOpenWithdrawCapital,
      handleInvest,
      handleUpgrade,
      handleWithdraw,
      fetchData,
    },
  };
}
