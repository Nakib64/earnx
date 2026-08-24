'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  KeyRound,
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

    // If query matches the selected user, DO NOT re-search
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ── 1. TOP LUXURY BANNER ── */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Withdrawal Management</h1>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Monitor user withdrawals, manage SMS OTP codes, and route payment balances directly to target member accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-[#023322] border border-[#d4af37]/40 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-emerald-300">
            Total Requests: <strong className="text-white">{totalCount}</strong>
          </div>
          <button
            onClick={() => fetchWithdrawals()}
            disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl transition-all cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. METRIC SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Volume */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
            ৳{totalWithdrawnAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">Across current page view</div>
        </div>

        {/* Card 2: Pending Requests */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Action</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">Awaiting payment routing</div>
        </div>

        {/* Card 3: Completed / Paid */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Paid Withdrawals</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
            {approvedCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">Successfully settled</div>
        </div>

        {/* Card 4: Total Records */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Queue</span>
            <div className="w-8 h-8 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">All time withdrawal requests</div>
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

      {/* ── 3. SEARCH & STATUS FILTER CONTROLS ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by User Name, User Code (EX1001), Phone, or 6-digit OTP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
          />
          {isSearchingTable ? (
            <span className="absolute right-3.5 top-3 text-xs text-[#005A36] flex items-center gap-1 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-[#005A36]" />
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          {(['ALL', 'PENDING', 'APPROVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab === 'PENDING' ? 'Pending' : 'Paid / Settled'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. WITHDRAWALS TABLE ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] sm:text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">6-Digit OTP</th>
                <th className="py-3.5 px-4">Requested Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Paid To Recipient</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#005A36]" />
                    <p className="font-bold">Loading withdrawal records...</p>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm text-slate-700">No withdrawal requests found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different user code or phone number.</p>
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const isPending = w.status === 'PENDING';
                  const isPaid = w.status === 'APPROVED';

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-[#005A36] font-black text-xs flex items-center justify-center shrink-0">
                            {w.user?.full_name ? w.user.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {w.user?.full_name || 'No Name'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span className="font-bold text-[#005A36] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                                {w.user?.referral_code || '—'}
                              </span>
                              <span>•</span>
                              <span>{w.user?.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Amount */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                        ৳{Number(w.amount).toFixed(2)}
                      </td>

                      {/* 3. OTP Chip */}
                      <td className="py-3.5 px-4">
                        {w.otp ? (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono font-black text-xs text-slate-800">
                            <span>{w.otp}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyOtp(w.otp!)}
                              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Copy OTP"
                            >
                              {copiedOtp === w.otp ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                        <div>{new Date(w.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 border border-amber-300 text-amber-800 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                            <div className="text-[10px] text-slate-500 font-mono">
                              <span className="font-bold text-purple-700">{w.paid_to_user.referral_code}</span> • {w.paid_to_user.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Resend OTP */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleResendOtp(w.id)}
                              disabled={resendingId === w.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-lg text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                              <span>Payment</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400">Settled</span>
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
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
            <span className="text-slate-600 font-medium">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. PAYMENT MODAL (LUXURY EMERALD / GOLD THEME) ── */}
      {paymentModal.isOpen && paymentModal.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            {/* Close Button */}
            <button
              onClick={() => setPaymentModal({ isOpen: false, withdrawal: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 mb-2">
                <Banknote className="w-3.5 h-3.5 text-amber-600" />
                <span>Execute Withdrawal Payment</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Add Balance to Target Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Search and select the member account to credit the withdrawal funds.
              </p>
            </div>

            {/* Withdrawal Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Withdrawn By:</span>
                <strong className="text-slate-900">
                  {paymentModal.withdrawal.user?.full_name || 'Member'} ({paymentModal.withdrawal.user?.referral_code})
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Withdrawal Amount:</span>
                <strong className="text-lg font-black text-[#005A36]">
                  ৳{Number(paymentModal.withdrawal.amount).toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Withdrawal OTP:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                  {paymentModal.withdrawal.otp || '—'}
                </span>
              </div>
            </div>

            {/* User Search Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
                />
                {searchingTarget && (
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse">
                    Searching...
                  </span>
                )}

                {/* Suggestions Dropdown (Matching /dashboard/purchase) */}
                {showTargetDropdown && targetResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {targetResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectTargetUser(u)}
                        className="w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900">
                            {u.full_name || 'No Name'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Phone: {u.phone} • Code: <span className="font-bold text-[#005A36]">{u.referral_code}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {u.referral_code}
                          </span>
                          {u.wallet_balance !== undefined && (
                            <div className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">
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

            {/* Auto-filled Target Member Details (Same 3-grid as /dashboard/purchase) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target User Name</label>
                <input
                  type="text"
                  readOnly
                  value={selectedTargetUser?.full_name || '—'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Phone Number</label>
                <input
                  type="text"
                  readOnly
                  value={selectedTargetUser?.phone || '—'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target User Id</label>
                <input
                  type="text"
                  readOnly
                  value={selectedTargetUser?.referral_code || '—'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#005A36] focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentModal({ isOpen: false, withdrawal: null })}
                disabled={processingPayment}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={!selectedTargetUser || processingPayment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Confirm & Credit ৳{Number(paymentModal.withdrawal.amount).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
