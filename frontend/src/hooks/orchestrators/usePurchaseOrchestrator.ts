'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { useDebounce } from '../useDebounce';
import { SystemConfigMap } from '../../types';

export interface UserSearchResult {
  id: string;
  full_name: string | null;
  email?: string | null;
  phone: string;
  referral_code: string;
  status: 'DISABLED' | 'ACTIVE';
  is_premium: boolean;
  referred_by?: {
    id: string;
    full_name: string | null;
    phone: string;
    referral_code: string;
  } | null;
}

export interface InvestmentPlan {
  id: string;
  title: string;
  amount: number;
  monthly_return_percent: number;
  duration_months: number | null;
  is_lifetime: boolean;
}

export interface PurchaseModalState {
  isOpen: boolean;
  type: 'CONFIRM' | 'DUPLICATE_ERROR' | 'BALANCE_ERROR' | 'SUCCESS';
  title: string;
  message: string;
  details?: any;
}

export function usePurchaseOrchestrator() {
  const { user, refreshUserProfile } = useAuth();

  // Package Type & Investment Plans
  const [packageType, setPackageType] = useState<'PREMIUM' | 'INVESTMENT'>('PREMIUM');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [activePlans, setActivePlans] = useState<InvestmentPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Target User Search state
  const [targetQuery, setTargetQuery] = useState('');
  const debouncedTargetQuery = useDebounce(targetQuery, 300);
  const [targetResults, setTargetResults] = useState<UserSearchResult[]>([]);
  const [searchingTarget, setSearchingTarget] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<UserSearchResult | null>(null);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Referrer / Sponsor Search state
  const [referrerQuery, setReferrerQuery] = useState('');
  const debouncedReferrerQuery = useDebounce(referrerQuery, 300);
  const [referrerResults, setReferrerResults] = useState<UserSearchResult[]>([]);
  const [searchingReferrer, setSearchingReferrer] = useState(false);
  const [selectedReferrerUser, setSelectedReferrerUser] = useState<UserSearchResult | null>(null);
  const [showReferrerDropdown, setShowReferrerDropdown] = useState(false);

  // Modal Dialog States
  const [submitting, setSubmitting] = useState(false);
  const [modalState, setModalState] = useState<PurchaseModalState>({
    isOpen: false,
    type: 'CONFIRM',
    title: '',
    message: '',
  });

  const [premiumFee, setPremiumFee] = useState<number>(1000);

  // Fetch global system config fees
  const fetchSystemConfigs = useCallback(async () => {
    const res = await apiFetch<SystemConfigMap>('/system-config/public');
    if (res.success && res.data) {
      if (res.data.PREMIUM_FEE) {
        const fee = parseFloat(res.data.PREMIUM_FEE);
        if (!isNaN(fee)) setPremiumFee(fee);
      }
    }
  }, []);

  // Fetch active investment plans
  const fetchInvestmentPlans = useCallback(async () => {
    setLoadingPlans(true);
    const res = await apiFetch<InvestmentPlan[]>('/investments/plans');
    if (res.success && res.data) {
      setActivePlans(res.data);
      if (res.data.length > 0 && !selectedPlanId) {
        setSelectedPlanId(res.data[0].id);
      }
    }
    setLoadingPlans(false);
  }, [selectedPlanId]);

  useEffect(() => {
    fetchSystemConfigs();
    fetchInvestmentPlans();
  }, [fetchSystemConfigs, fetchInvestmentPlans]);

  // Target User Search API query
  useEffect(() => {
    const searchTarget = async () => {
      const q = debouncedTargetQuery.trim();
      if (!q || (selectedTargetUser && q.toLowerCase() === selectedTargetUser.referral_code.toLowerCase())) {
        setTargetResults([]);
        setShowTargetDropdown(false);
        return;
      }

      setSearchingTarget(true);
      const res = await apiFetch<UserSearchResult[]>(`/users/search?query=${encodeURIComponent(q)}`);
      if (res.success && res.data) {
        setTargetResults(res.data);
        setShowTargetDropdown(res.data.length > 0);
      } else {
        setTargetResults([]);
        setShowTargetDropdown(false);
      }
      setSearchingTarget(false);
    };

    searchTarget();
  }, [debouncedTargetQuery, selectedTargetUser]);

  const handleSelectTargetUser = (u: UserSearchResult) => {
    setSelectedTargetUser(u);
    setTargetQuery(u.referral_code);
    setShowTargetDropdown(false);
  };

  const handleSelectSelfAsTarget = () => {
    if (!user) return;
    const selfObj: UserSearchResult = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      referral_code: user.referral_code,
      status: user.status as any,
      is_premium: user.is_premium || false,
    };
    handleSelectTargetUser(selfObj);
  };

  // Referrer User Search API query
  useEffect(() => {
    const searchReferrer = async () => {
      const q = debouncedReferrerQuery.trim();
      if (!q || (selectedReferrerUser && q.toLowerCase() === selectedReferrerUser.referral_code.toLowerCase())) {
        setReferrerResults([]);
        setShowReferrerDropdown(false);
        return;
      }

      setSearchingReferrer(true);
      const res = await apiFetch<UserSearchResult[]>(`/users/search?query=${encodeURIComponent(q)}`);
      if (res.success && res.data) {
        setReferrerResults(res.data);
        setShowReferrerDropdown(res.data.length > 0);
      } else {
        setReferrerResults([]);
        setShowReferrerDropdown(false);
      }
      setSearchingReferrer(false);
    };

    searchReferrer();
  }, [debouncedReferrerQuery, selectedReferrerUser]);

  const handleSelectReferrerUser = (u: UserSearchResult) => {
    setSelectedReferrerUser(u);
    setReferrerQuery(u.referral_code);
    setShowReferrerDropdown(false);
  };

  const handleSelectSelfAsReferrer = () => {
    if (!user) return;
    const selfObj: UserSearchResult = {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone || '',
      referral_code: user.referral_code,
      status: user.status as any,
      is_premium: user.is_premium || false,
    };
    handleSelectReferrerUser(selfObj);
  };

  const handleSelectTargetSponsorAsReferrer = () => {
    if (!selectedTargetUser?.referred_by) return;
    const ref = selectedTargetUser.referred_by;
    const refObj: UserSearchResult = {
      id: ref.id,
      full_name: ref.full_name,
      phone: ref.phone,
      referral_code: ref.referral_code,
      status: 'ACTIVE',
      is_premium: true,
    };
    handleSelectReferrerUser(refObj);
  };

  // Auto-fill referrer when target user changes (if target user has a sponsor)
  useEffect(() => {
    if (selectedTargetUser?.referred_by) {
      const ref = selectedTargetUser.referred_by;
      setSelectedReferrerUser({
        id: ref.id,
        full_name: ref.full_name,
        phone: ref.phone,
        referral_code: ref.referral_code,
        status: 'ACTIVE',
        is_premium: true,
      });
      setReferrerQuery(ref.referral_code);
    }
  }, [selectedTargetUser]);

  // Price Calculation
  const getPackagePrice = (): number => {
    if (packageType === 'PREMIUM') return premiumFee;
    if (packageType === 'INVESTMENT') {
      const plan = activePlans.find((p) => p.id === selectedPlanId);
      return plan ? Number(plan.amount) : 0;
    }
    return 0;
  };

  const currentPrice = getPackagePrice();
  const payerBalance = Number(user?.wallet_balance || 0);

  // Pre-purchase Validation & Submit
  const handleInitiatePurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTargetUser) {
      setModalState({
        isOpen: true,
        type: 'DUPLICATE_ERROR',
        title: 'Target User Required',
        message: 'Please search and select the target user code before proceeding.',
      });
      return;
    }

    if (packageType === 'PREMIUM') {
      if (selectedTargetUser.id !== user?.id && !user?.is_premium) {
        setModalState({
          isOpen: true,
          type: 'DUPLICATE_ERROR',
          title: 'Premium Status Required',
          message: 'You must be a Premium Member yourself in order to purchase Premium status for other users.',
        });
        return;
      }
      if (selectedTargetUser.status !== 'ACTIVE') {
        setModalState({
          isOpen: true,
          type: 'DUPLICATE_ERROR',
          title: 'Account Not Active',
          message: `User "${selectedTargetUser.full_name || selectedTargetUser.phone}" (User Code: ${
            selectedTargetUser.referral_code
          }) is not an ACTIVE account. An account must be activated before taking Premiumship.`,
        });
        return;
      }
      if (selectedTargetUser.is_premium) {
        setModalState({
          isOpen: true,
          type: 'DUPLICATE_ERROR',
          title: 'Already Premium Member',
          message: `User "${selectedTargetUser.full_name || selectedTargetUser.phone}" (User Code: ${
            selectedTargetUser.referral_code
          }) is already a Premium Member. Premium Subscription cannot be purchased again.`,
        });
        return;
      }
    }

    if (packageType === 'INVESTMENT' && !selectedPlanId) {
      setModalState({
        isOpen: true,
        type: 'DUPLICATE_ERROR',
        title: 'Investment Plan Required',
        message: 'Please select an investment plan from the list.',
      });
      return;
    }

    if (payerBalance < currentPrice) {
      setModalState({
        isOpen: true,
        type: 'BALANCE_ERROR',
        title: 'Insufficient Wallet Balance',
        message: `Your available account balance is ৳${payerBalance.toFixed(
          2
        )}, but this package requires ৳${currentPrice.toFixed(
          2
        )}. Please deposit funds into your main balance to proceed.`,
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'CONFIRM',
      title: 'Confirm Purchase',
      message: `You are about to purchase the ${packageType} Package for user "${
        selectedTargetUser.full_name || selectedTargetUser.phone
      }" (${selectedTargetUser.referral_code}) for ৳${currentPrice.toFixed(
        2
      )}. ৳${currentPrice.toFixed(2)} will be deducted from your wallet balance.`,
    });
  };

  // Execution
  const handleExecutePurchase = async () => {
    if (!selectedTargetUser) return;
    setSubmitting(true);

    let res: any;
    if (packageType === 'PREMIUM') {
      res = await apiFetch('/purchases/buy', {
        method: 'POST',
        body: JSON.stringify({
          target_user_code: selectedTargetUser.referral_code,
          package_type: 'PREMIUM',
          referrer_code: selectedReferrerUser?.referral_code || undefined,
        }),
      });
    } else if (packageType === 'INVESTMENT') {
      res = await apiFetch('/purchases/buy', {
        method: 'POST',
        body: JSON.stringify({
          target_user_code: selectedTargetUser.referral_code,
          package_type: 'INVESTMENT',
          investment_plan_id: selectedPlanId,
        }),
      });
    }

    setSubmitting(false);

    if (res && res.success) {
      await refreshUserProfile();
      setModalState({
        isOpen: true,
        type: 'SUCCESS',
        title: 'Purchase Successful!',
        message: `Successfully purchased ${packageType} Package for "${
          selectedTargetUser.full_name || selectedTargetUser.phone
        }". ৳${currentPrice.toFixed(2)} has been deducted from your account.`,
      });

      setSelectedTargetUser(null);
      setTargetQuery('');
      setSelectedReferrerUser(null);
      setReferrerQuery('');
    } else {
      const errMsg = res?.error?.message || 'Failed to purchase package.';
      if (errMsg.includes('already') || errMsg.includes('ACTIVE') || errMsg.includes('Premium')) {
        setModalState({
          isOpen: true,
          type: 'DUPLICATE_ERROR',
          title: 'Package Already Active',
          message: errMsg,
        });
      } else if (errMsg.includes('balance') || errMsg.includes('Insufficient')) {
        setModalState({
          isOpen: true,
          type: 'BALANCE_ERROR',
          title: 'Insufficient Wallet Balance',
          message: errMsg,
        });
      } else {
        setModalState({
          isOpen: true,
          type: 'DUPLICATE_ERROR',
          title: 'Purchase Error',
          message: errMsg,
        });
      }
    }
  };

  return {
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
      premiumFee,
    },
    computed: {
      user,
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
  };
}
