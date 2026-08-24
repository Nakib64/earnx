'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  User,
  X,
  ArrowRight,
} from 'lucide-react';

interface UserSearchResult {
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

interface InvestmentPlan {
  id: string;
  title: string;
  amount: number;
  monthly_return_percent: number;
  duration_months: number | null;
  is_lifetime: boolean;
}

export default function PurchasePage() {
  const { user, refreshUserProfile } = useAuth();

  // Package Type & Investment Plans
  const [packageType, setPackageType] = useState<'ACTIVATION' | 'PREMIUM' | 'INVESTMENT'>(
    'ACTIVATION'
  );
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

  // Referrer / Sponsor Search state (for PREMIUM package)
  const [referrerQuery, setReferrerQuery] = useState('');
  const debouncedReferrerQuery = useDebounce(referrerQuery, 300);
  const [referrerResults, setReferrerResults] = useState<UserSearchResult[]>([]);
  const [searchingReferrer, setSearchingReferrer] = useState(false);
  const [selectedReferrerUser, setSelectedReferrerUser] = useState<UserSearchResult | null>(null);
  const [showReferrerDropdown, setShowReferrerDropdown] = useState(false);



  // Modal Dialog States
  const [submitting, setSubmitting] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'CONFIRM' | 'DUPLICATE_ERROR' | 'BALANCE_ERROR' | 'SUCCESS';
    title: string;
    message: string;
    details?: any;
  }>({
    isOpen: false,
    type: 'CONFIRM',
    title: '',
    message: '',
  });

  const activationFee = 500;
  const premiumFee = 1000;

  // Fetch all active investment plans
  const fetchActivePlans = useCallback(async () => {
    setLoadingPlans(true);
    const res = await apiFetch<any>('/investments/plans');
    let plansList: InvestmentPlan[] = [];
    if (res.success && Array.isArray(res.data)) {
      plansList = res.data;
    } else if (Array.isArray(res)) {
      plansList = res as any;
    }

    setActivePlans(plansList);
    if (plansList.length > 0) {
      setSelectedPlanId(plansList[0].id);
    }
    setLoadingPlans(false);
  }, []);

  useEffect(() => {
    fetchActivePlans();
  }, [fetchActivePlans]);

  // Debounced search for Target User
  useEffect(() => {
    if (!debouncedTargetQuery.trim()) {
      setTargetResults([]);
      setShowTargetDropdown(false);
      return;
    }

    // If query matches the already selected user, keep dropdown closed
    if (selectedTargetUser && selectedTargetUser.referral_code.toLowerCase() === debouncedTargetQuery.trim().toLowerCase()) {
      setShowTargetDropdown(false);
      return;
    }

    const searchTarget = async () => {
      setSearchingTarget(true);
      const res = await apiFetch<any>(
        `/users/search-by-code?q=${encodeURIComponent(debouncedTargetQuery.trim())}&code_only=true`
      );
      if (res.success && Array.isArray(res.data)) {
        setTargetResults(res.data);
        setShowTargetDropdown(true);
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
      email: user.email || null,
      phone: user.phone,
      referral_code: user.referral_code,
      status: user.status as any,
      is_premium: user.is_premium || false,
    };
    handleSelectTargetUser(selfObj);
  };

  // Debounced search for Referrer / Sponsor User
  useEffect(() => {
    if (!debouncedReferrerQuery.trim()) {
      setReferrerResults([]);
      setShowReferrerDropdown(false);
      return;
    }

    // If query matches the already selected referrer, keep dropdown closed
    if (selectedReferrerUser && selectedReferrerUser.referral_code.toLowerCase() === debouncedReferrerQuery.trim().toLowerCase()) {
      setShowReferrerDropdown(false);
      return;
    }

    const searchReferrer = async () => {
      setSearchingReferrer(true);
      const res = await apiFetch<any>(
        `/users/search-by-code?q=${encodeURIComponent(debouncedReferrerQuery.trim())}&code_only=true`
      );
      if (res.success && Array.isArray(res.data)) {
        setReferrerResults(res.data);
        setShowReferrerDropdown(true);
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
      phone: user.phone,
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
    if (packageType === 'ACTIVATION') return activationFee;
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

    // 1. Check duplicate package
    if (packageType === 'ACTIVATION' && selectedTargetUser.status === 'ACTIVE') {
      setModalState({
        isOpen: true,
        type: 'DUPLICATE_ERROR',
        title: 'Account Already Active',
        message: `User "${selectedTargetUser.full_name || selectedTargetUser.phone}" (User Code: ${
          selectedTargetUser.referral_code
        }) is already an ACTIVE account. Account Activation cannot be purchased again for an active member.`,
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

    // 2. Check balance
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

    // Confirmation Modal
    setModalState({
      isOpen: true,
      type: 'CONFIRM',
      title: 'Confirm Package Purchase',
      message: `Do you want to buy ${packageType} package for User Code "${selectedTargetUser.referral_code}" for ৳${currentPrice.toFixed(
        2
      )} using your account balance?`,
      details: {
        target: selectedTargetUser,
        packageType,
        price: currentPrice,
      },
    });
  };

  // Execute API Request
  const handleExecutePurchase = async () => {
    if (!selectedTargetUser) return;

    setSubmitting(true);
    const res = await apiFetch<any>('/purchases/buy', {
      method: 'POST',
      body: JSON.stringify({
        target_user_code: selectedTargetUser.referral_code,
        package_type: packageType,
        investment_plan_id: packageType === 'INVESTMENT' ? selectedPlanId : undefined,
        referrer_code: packageType === 'PREMIUM' && selectedReferrerUser ? selectedReferrerUser.referral_code : undefined,
      }),
    });

    setSubmitting(false);

    if (res.success) {
      setModalState({
        isOpen: true,
        type: 'SUCCESS',
        title: 'Purchase Successful!',
        message: res.data?.message || 'Package purchased successfully!',
        details: res.data,
      });
      await refreshUserProfile();
      if (packageType === 'ACTIVATION') {
        setSelectedTargetUser((prev) => (prev ? { ...prev, status: 'ACTIVE' } : null));
      } else if (packageType === 'PREMIUM') {
        setSelectedTargetUser((prev) => (prev ? { ...prev, is_premium: true } : null));
      }
    } else {
      const errMsg = res.error?.message || 'Failed to purchase package.';
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
      <form onSubmit={handleInitiatePurchase} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {/* 1. Target User Code Search Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Target User Id <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleSelectSelfAsTarget}
              className="text-xs text-[#005A36] font-bold hover:underline cursor-pointer flex items-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Use My Own Id</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Enter or search Target User Id (e.g. EX1001)..."
              value={targetQuery}
              onChange={(e) => {
                setTargetQuery(e.target.value);
                if (selectedTargetUser && e.target.value.trim().toLowerCase() !== selectedTargetUser.referral_code.toLowerCase()) {
                  setSelectedTargetUser(null);
                }
              }}
              onFocus={() => targetResults.length > 0 && !selectedTargetUser && setShowTargetDropdown(true)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
            />
            {searchingTarget && (
              <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse">
                Searching...
              </span>
            )}

            {/* Target Dropdown Suggestions */}
            {showTargetDropdown && targetResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {targetResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectTargetUser(u)}
                    className="w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-black text-[#005A36]">
                        Code: <span className="underline">{u.referral_code}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        Name: {u.full_name || 'No Name'} • Phone: {u.phone}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {u.status} {u.is_premium && '• PREMIUM'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Auto-filled Target Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Target User Name</label>
              <input
                type="text"
                readOnly
                value={selectedTargetUser?.full_name || '—'}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Phone Number</label>
              <input
                type="text"
                readOnly
                value={selectedTargetUser?.phone || '—'}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Target User Email</label>
              <input
                type="text"
                readOnly
                value={selectedTargetUser?.email || '—'}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#005A36]"
              />
            </div>
          </div>

          {/* 2. Package Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Select Package Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={packageType}
              onChange={(e) => setPackageType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] cursor-pointer"
            >
              <option value="ACTIVATION">Account Activation Package (৳{activationFee})</option>
              <option value="PREMIUM">Premium Subscription Package (৳{premiumFee})</option>
              <option value="INVESTMENT">Investment Package Plan</option>
            </select>
          </div>

          {/* 3. All Investment Plans List Dropdown (shown when packageType === 'INVESTMENT') */}
          {packageType === 'INVESTMENT' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Select Investment Plan <span className="text-rose-500">*</span>
              </label>
              {loadingPlans ? (
                <div className="text-xs text-slate-400 italic">Loading active plans...</div>
              ) : activePlans.length > 0 ? (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] cursor-pointer"
                >
                  {activePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title} — ৳{Number(plan.amount)} ({plan.monthly_return_percent}% Monthly Return {plan.is_lifetime ? '• Lifetime' : `• ${plan.duration_months} Months`})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-rose-500 font-bold">No active investment plans available.</div>
              )}
            </div>
          )}

          {/* 4. Referral / Sponsor Code Search & Details (shown when packageType === 'PREMIUM') */}
          {packageType === 'PREMIUM' && (
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Referral / Sponsor Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3 text-xs font-bold">
                    {selectedTargetUser?.referred_by && (
                      <button
                        type="button"
                        onClick={handleSelectTargetSponsorAsReferrer}
                        className="text-xs text-purple-700 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                      >
                        <span>Use Target's Sponsor</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSelectSelfAsReferrer}
                      className="text-xs text-[#005A36] font-bold hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Use My Own Code</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter or search Referral / Sponsor Code (e.g. EX1001)..."
                    value={referrerQuery}
                    onChange={(e) => {
                      setReferrerQuery(e.target.value);
                      if (selectedReferrerUser && e.target.value.trim().toLowerCase() !== selectedReferrerUser.referral_code.toLowerCase()) {
                        setSelectedReferrerUser(null);
                      }
                    }}
                    onFocus={() => referrerResults.length > 0 && !selectedReferrerUser && setShowReferrerDropdown(true)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
                  />
                  {searchingReferrer && (
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse">
                      Searching...
                    </span>
                  )}

                  {/* Referrer Dropdown Suggestions */}
                  {showReferrerDropdown && referrerResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {referrerResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectReferrerUser(u)}
                          className="w-full text-left p-3 hover:bg-purple-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-black text-purple-800">
                              Code: <span className="underline">{u.referral_code}</span>
                            </div>
                            <div className="text-[10px] text-slate-600 font-medium">
                              Name: {u.full_name || 'No Name'} • Phone: {u.phone}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            {u.status} {u.is_premium && '• PREMIUM'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            {/* Auto-filled Referrer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-50/60 p-4 rounded-xl border border-purple-100">
              <div>
                <label className="block text-[10px] font-bold text-purple-700 uppercase">Referral User Name</label>
                <input
                  type="text"
                  readOnly
                  value={selectedReferrerUser?.full_name || '—'}
                  className="w-full bg-white border border-purple-200/80 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-purple-700 uppercase">Referral Phone Number</label>
                <input
                  type="text"
                  readOnly
                  value={selectedReferrerUser?.phone || '—'}
                  className="w-full bg-white border border-purple-200/80 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-purple-700 uppercase">Referral Code</label>
                <input
                  type="text"
                  readOnly
                  value={selectedReferrerUser?.referral_code || '—'}
                  className="w-full bg-white border border-purple-200/80 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-purple-800"
                />
              </div>
            </div>
          </div>
        )}

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

      {/* POPUP MODALS SYSTEM */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              {modalState.type === 'CONFIRM' && (
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#005A36] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              )}
              {(modalState.type === 'DUPLICATE_ERROR' || modalState.type === 'BALANCE_ERROR') && (
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {modalState.type === 'SUCCESS' && (
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              <div>
                <h3 className="text-base font-black text-slate-900">{modalState.title}</h3>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {modalState.message}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              {modalState.type === 'CONFIRM' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleExecutePurchase}
                    className="px-5 py-2 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white text-xs font-black shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Confirm & Buy'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                  className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  OK, Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
