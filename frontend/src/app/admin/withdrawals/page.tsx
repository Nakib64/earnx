'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { WithdrawalRequest } from '../../../types';
import {
  Banknote,
  Search,
  RefreshCw,
  Copy,
  Check,
  Send,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCheck,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useDebounce } from '../../../hooks/useDebounce';

interface RecipientSearchResult {
  id: string;
  full_name: string | null;
  phone: string;
  referral_code: string;
  wallet_balance?: number | string;
  status?: string;
  is_premium?: boolean;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Copy state
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // Resend OTP state
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    withdrawal: WithdrawalRequest | null;
  }>({
    isOpen: false,
    withdrawal: null,
  });

  const [targetQuery, setTargetQuery] = useState('');
  const debouncedTargetQuery = useDebounce(targetQuery, 300);
  const [targetResults, setTargetResults] = useState<RecipientSearchResult[]>([]);
  const [searchingTarget, setSearchingTarget] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<RecipientSearchResult | null>(null);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const isSearchingTable = search !== debouncedSearch || loading;

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    let url = `/withdrawals?page=${page}&limit=15`;
    if (debouncedSearch.trim()) {
      url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
    }
    if (statusFilter !== 'ALL') {
      url += `&status=${statusFilter}`;
    }

    const res = await apiFetch<any>(url, { isAdmin: true });
    if (res.success && res.data) {
      setWithdrawals(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalCount(res.data.meta?.total || 0);
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to load withdrawals' });
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Debounced search for Admin Payment modal target user
  useEffect(() => {
    const q = debouncedTargetQuery.trim();
    if (!q) {
      setTargetResults([]);
      setShowTargetDropdown(false);
      setSearchingTarget(false);
      return;
    }

    if (
      selectedTargetUser &&
      (selectedTargetUser.referral_code.toLowerCase() === q.toLowerCase() ||
        selectedTargetUser.phone === q ||
        (selectedTargetUser.full_name && selectedTargetUser.full_name.toLowerCase() === q.toLowerCase()))
    ) {
      setShowTargetDropdown(false);
      setSearchingTarget(false);
      return;
    }

    setSearchingTarget(true);

    (async () => {
      const res = await apiFetch<any>(
        `/admin/users/search?q=${encodeURIComponent(q)}`,
        { isAdmin: true }
      );
      if (res.success && Array.isArray(res.data)) {
        setTargetResults(res.data);
        setShowTargetDropdown(true);
      } else {
        const fallbackRes = await apiFetch<any>(
          `/users/search-by-code?q=${encodeURIComponent(q)}`,
          { isAdmin: true }
        );
        if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
          setTargetResults(fallbackRes.data);
          setShowTargetDropdown(true);
        } else {
          setTargetResults([]);
          setShowTargetDropdown(false);
        }
      }
      setSearchingTarget(false);
    })();
  }, [debouncedTargetQuery, selectedTargetUser]);

  // Aggregate Metrics
  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const approvedCount = withdrawals.filter((w) => w.status === 'APPROVED').length;
  const totalWithdrawnAmount = withdrawals.reduce((acc, w) => acc + Number(w.amount || 0), 0);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const handleResendOtp = async (withdrawalId: string) => {
    if (resendingId) return;
    setResendingId(withdrawalId);
    setAlertMsg(null);
    const res = await apiFetch<any>(`/withdrawals/${withdrawalId}/resend-otp`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: res.data?.message || 'OTP resent to user phone successfully.',
      });
      fetchWithdrawals();
    } else {
      setAlertMsg({
        type: 'error',
        text: res.error?.message || 'Failed to resend OTP.',
      });
    }
    setResendingId(null);
  };

  const handleOpenPaymentModal = (w: WithdrawalRequest) => {
    setPaymentModal({
      isOpen: true,
      withdrawal: w,
    });
    setTargetQuery('');
    setTargetResults([]);
    setSelectedTargetUser(null);
    setShowTargetDropdown(false);
    setSearchingTarget(false);
  };

  const handleSelectTargetUser = (u: RecipientSearchResult) => {
    setSelectedTargetUser(u);
    setTargetQuery(u.referral_code);
    setShowTargetDropdown(false);
    setTargetResults([]);
    setSearchingTarget(false);
  };

  const handleConfirmPayment = async () => {
    if (!paymentModal.withdrawal || !selectedTargetUser) return;

    setProcessingPayment(true);
    setAlertMsg(null);

    const res = await apiFetch<any>(`/withdrawals/${paymentModal.withdrawal.id}/payment`, {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ target_user_id: selectedTargetUser.id }),
    });

    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: res.data?.message || 'Payment successfully credited to target user!',
      });
      setPaymentModal({ isOpen: false, withdrawal: null });
      fetchWithdrawals();
    } else {
      setAlertMsg({
        type: 'error',
        text: res.error?.message || 'Payment routing failed.',
      });
    }
    setProcessingPayment(false);
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Financial Disbursements &amp; Settlement
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Withdrawal Requests &amp; Payout Queue
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Monitor member withdrawal requests, audit 6-digit SMS OTP security codes, and route settlement balances to recipient member accounts.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Active Payout Queue &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {totalCount} Total Requests ({pendingCount} Pending)
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={() => fetchWithdrawals()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 2. TOP 4 KPI METRIC CARDS (Matches User Dashboard Boxes) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Volume */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Page Volume</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                ৳{totalWithdrawnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Current page items
              </span>
            </div>
          </div>

          {/* Card 2: Pending Requests */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Action</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                {pendingCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Awaiting payment routing
              </span>
            </div>
          </div>

          {/* Card 3: Paid / Settled */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Paid Withdrawals</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
                {approvedCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Successfully credited
              </span>
            </div>
          </div>

          {/* Card 4: Total Queue */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Queue</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {totalCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                All-time withdrawal requests
              </span>
            </div>
          </div>
        </div>

        {/* Alert Notification */}
        {alertMsg && (
          <AlertBanner
            type={alertMsg.type}
            message={alertMsg.text}
            onClose={() => setAlertMsg(null)}
          />
        )}

        {/* ── 3. SEARCH & STATUS FILTER CONTROLS (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by member name, user code (EX1001), phone, or 6-digit OTP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
            {isSearchingTable ? (
              <span className="absolute right-3.5 top-3 text-xs text-[#009F6B] flex items-center gap-1 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-[#009F6B]" />
              </span>
            ) : search.trim() ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/70 shrink-0 overflow-x-auto">
            {(['ALL', 'PENDING', 'APPROVED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-[0.98] ${statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
              >
                {tab === 'ALL' ? 'All Requests' : tab === 'PENDING' ? 'Pending Queue' : 'Paid / Settled'}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. WITHDRAWALS TABLE CARD (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold text-[10.5px] border-b border-slate-100">
                  <th className="py-3.5 px-5">Member Info</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">6-Digit OTP</th>
                  <th className="py-3.5 px-4">Requested Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Paid To Recipient</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium text-slate-700">
                {loading && withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#009F6B]" />
                      <p className="font-semibold text-xs">Loading withdrawal records...</p>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-400">
                      <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm text-slate-700">No withdrawal requests found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try searching with a different user code or phone number.</p>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => {
                    const isPending = w.status === 'PENDING';
                    const isPaid = w.status === 'APPROVED';

                    return (
                      <tr key={w.id} className="hover:bg-white/60 transition-colors">
                        {/* 1. Member Info */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] font-bold text-xs shrink-0">
                              {w.user?.full_name ? w.user.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {w.user?.full_name || 'No Name'}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-bold text-[#009F6B] bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 text-[10px]">
                                  {w.user?.referral_code || '—'}
                                </span>
                                <span>&bull;</span>
                                <span className=" text-slate-400">{w.user?.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Amount */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          ৳{Number(w.amount).toFixed(2)}
                        </td>

                        {/* 3. OTP Chip */}
                        <td className="py-3.5 px-4">
                          {w.otp ? (
                            <div className="inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-xl  font-bold text-xs text-slate-800">
                              <span>{w.otp}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyOtp(w.otp!)}
                                className="text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                                title="Copy OTP"
                              >
                                {copiedOtp === w.otp ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">—</span>
                          )}
                        </td>

                        {/* 4. Date */}
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          <div className="font-medium">{new Date(w.created_at).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* 5. Status Badge */}
                        <td className="py-3.5 px-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Pending</span>
                            </span>
                          ) : isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#009F6B]" />
                              <span>Paid</span>
                            </span>
                          ) : (
                            <StatusBadge status={w.status} />
                          )}
                        </td>

                        {/* 6. Paid To Recipient */}
                        <td className="py-3.5 px-4">
                          {w.paid_to_user ? (
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {w.paid_to_user.full_name || 'Member'}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                <span className="font-bold text-purple-700">{w.paid_to_user.referral_code}</span> &bull;{' '}
                                <span className=" text-slate-400">{w.paid_to_user.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">—</span>
                          )}
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Resend OTP */}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleResendOtp(w.id)}
                                disabled={resendingId === w.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Resend 6-digit OTP to user"
                              >
                                <Send className={`w-3.5 h-3.5 ${resendingId === w.id ? 'animate-pulse text-amber-600' : ''}`} />
                                <span>{resendingId === w.id ? 'Sending...' : 'Resend OTP'}</span>
                              </button>
                            )}

                            {/* Payment Button */}
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPaymentModal(w)}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Route Payment</span>
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">Settled</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100/80 text-xs font-semibold text-slate-500">
              <span>
                Total <strong className="text-slate-800">{totalCount}</strong> records (Page {page} of {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. PAYMENT SETTLEMENT MODAL (Liquid Glassmorphism) ── */}
        {paymentModal.isOpen && paymentModal.withdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 relative space-y-5">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPaymentModal({ isOpen: false, withdrawal: null })}
                className="w-8 h-8 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer absolute top-5 right-5"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 mb-2">
                  <Banknote className="w-3.5 h-3.5 text-[#009F6B]" />
                  <span>Execute Settlement Credit</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Add Balance to Target Account</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Search and select the member account to credit the withdrawal funds.
                </p>
              </div>

              {/* Withdrawal Info Box */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Withdrawn By:</span>
                  <strong className="text-slate-900 font-bold">
                    {paymentModal.withdrawal.user?.full_name || 'Member'} ({paymentModal.withdrawal.user?.referral_code})
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Withdrawal Amount:</span>
                  <strong className="text-base font-bold text-[#009F6B]">
                    ৳{Number(paymentModal.withdrawal.amount).toFixed(2)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Security OTP:</span>
                  <span className=" font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-800">
                    {paymentModal.withdrawal.otp || '—'}
                  </span>
                </div>
              </div>

              {/* User Search Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recipient Member Code / Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search User Code (e.g. EX1001), Name, or Phone..."
                    value={targetQuery}
                    onChange={(e) => {
                      setTargetQuery(e.target.value);
                      if (selectedTargetUser && e.target.value.trim().toLowerCase() !== selectedTargetUser.referral_code.toLowerCase()) {
                        setSelectedTargetUser(null);
                      }
                    }}
                    onFocus={() => {
                      if (targetResults.length > 0 && !selectedTargetUser) setShowTargetDropdown(true);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none transition-all"
                  />
                  {searchingTarget && (
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse font-medium">
                      Searching...
                    </span>
                  )}

                  {/* Suggestions Dropdown */}
                  {showTargetDropdown && targetResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {targetResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectTargetUser(u)}
                          className="w-full text-left p-3 hover:bg-emerald-50/80 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {u.full_name || 'No Name'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Phone: <span className="">{u.phone}</span> &bull; Code:{' '}
                              <span className="font-bold text-[#009F6B]">{u.referral_code}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {u.referral_code}
                            </span>
                            {u.wallet_balance !== undefined && (
                              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                Bal: ৳{Number(u.wallet_balance).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-filled Target Member Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target User Name</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedTargetUser?.full_name || '—'}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Phone Number</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedTargetUser?.phone || '—'}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 text-xs  font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Referral Code</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedTargetUser?.referral_code || '—'}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#009F6B] focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, withdrawal: null })}
                  disabled={processingPayment}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={!selectedTargetUser || processingPayment}
                  className="px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {processingPayment ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Credit ৳{Number(paymentModal.withdrawal.amount).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
