'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { apiFetch } from '../../../../lib/api';
import { ActivationRequest, PremiumRequest, WithdrawalRequest } from '../../../../types';
import ApprovalsHeader from '../../../../components/approvals/ApprovalsHeader';
import { AlertBanner } from '../../../../components/common/AlertBanner';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { Check, X, Star, ShieldAlert, Layers, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface PendingQueueResponse {
  activations: ActivationRequest[];
  premiums: PremiumRequest[];
  withdrawals: WithdrawalRequest[];
}

const ITEMS_PER_PAGE = 10;

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function AdminPremiumApprovalsPage() {
  const { admin } = useAuth();
  const [premiums, setPremiums] = useState<PremiumRequest[]>([]);
  const [pendingActivationCount, setPendingActivationCount] = useState(0);
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchQueue = async () => {
    setLoading(true);
    const res = await apiFetch<PendingQueueResponse>('/admin/requests/pending', { isAdmin: true });
    if (res.success && res.data) {
      setPremiums(res.data.premiums || []);
      setPendingActivationCount((res.data.activations || []).filter(a => a.status === 'PENDING').length);
      setPendingWithdrawalCount((res.data.withdrawals || []).filter(w => w.status === 'PENDING').length);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchQueue();
  }, [admin]);

  // Reset to page 1 whenever search query or status filter changes
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const pendingPremiumCount = useMemo(
    () => premiums.filter(req => req.status === 'PENDING').length,
    [premiums]
  );

  const filtered = useMemo(() => {
    return premiums.filter((req) => {
      // Status filter check
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;

      // Search check
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        req.user?.full_name?.toLowerCase().includes(q) ||
        req.user?.phone?.toLowerCase().includes(q) ||
        req.user?.referral_code?.toLowerCase().includes(q) ||
        req.user?.referred_by?.full_name?.toLowerCase().includes(q) ||
        req.user?.referred_by?.phone?.toLowerCase().includes(q) ||
        req.status.toLowerCase().includes(q) ||
        req.rejection_reason?.toLowerCase().includes(q)
      );
    });
  }, [premiums, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers = getPaginationRange(currentPage, totalPages);

  const handleApprovePremium = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch<any>(`/admin/requests/premium/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });

    if (res.success) {
      const payouts = res.data?.payouts || [];
      const paidSummaries = payouts
        .filter((p: any) => p.qualified)
        .map((p: any) => `L${p.level}: ৳${p.amount} to (${p.parentPhone})`)
        .join(', ');
      const successText = paidSummaries
        ? `Approved Premium package! Commissions distributed: ${paidSummaries}`
        : 'Approved Premium package! User active for 1 year.';
      setMsg({ type: 'success', text: successText });
      toast.success('Premium upgrade approved!');
      await fetchQueue();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Approval failed' });
      toast.error(res.error?.message || 'Approval failed');
    }
    setProcessingId(null);
  };

  const handleRejectPremium = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/requests/premium/${id}/reject`, {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ reason: rejectReason.trim() || 'Admin rejected request' }),
    });

    if (res.success) {
      setMsg({ type: 'success', text: 'Premium request rejected.' });
      toast.info('Premium request rejected');
      setRejectingId(null);
      setRejectReason('');
      await fetchQueue();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Rejection failed' });
      toast.error(res.error?.message || 'Rejection failed');
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <ApprovalsHeader
        activationCount={pendingActivationCount}
        premiumCount={pendingPremiumCount}
        withdrawalCount={pendingWithdrawalCount}
      />

      {msg && <AlertBanner type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* PREMIUM REQUESTS QUEUE & HISTORY */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200 shadow-xs">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-400" />
            <span>Premium Upgrade Requests History</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
              {filtered.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            All historical premium upgrade records
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="premium-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, phone, referral code, or sponsor..."
              className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all w-full sm:w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval ({pendingPremiumCount})</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-xs text-slate-400 py-10 text-center animate-pulse">Loading premium records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-xs text-slate-400 py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
            {search || statusFilter !== 'ALL'
              ? 'No records matching your search/filter criteria.'
              : 'No premium upgrade request records found.'}
          </div>
        ) : (
          <>
            {/* Request rows */}
            <div className="space-y-3">
              {paginated.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-amber-300 hover:shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {req.user?.full_name || req.user?.phone}
                      </span>
                      <StatusBadge status={req.status as any} />
                    </div>
                    <div className="text-xs text-slate-600 font-mono space-x-3">
                      <span>Phone: <strong>{req.user?.phone}</strong></span>
                      <span>•</span>
                      <span>Code: <strong>{req.user?.referral_code}</strong></span>
                      <span>•</span>
                      <span className="text-slate-400">
                        Requested: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {req.user?.referred_by && (
                      <div className="text-xs text-purple-700 font-medium flex items-center space-x-1 pt-0.5">
                        <Layers className="w-3.5 h-3.5 text-purple-500" />
                        <span>
                          Sponsor / Referrer:{' '}
                          <strong>{req.user.referred_by.full_name || req.user.referred_by.phone}</strong>
                        </span>
                      </div>
                    )}
                    {req.rejection_reason && (
                      <div className="text-xs text-rose-600 font-medium pt-1">
                        Reason: {req.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Actions or Status Display */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleApprovePremium(req.id)}
                          disabled={processingId === req.id}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-60 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>{processingId === req.id ? 'Processing...' : 'Approve & Pay 5-Level Commissions'}</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(req.id)}
                          disabled={processingId === req.id}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    ) : req.status === 'APPROVED' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 flex items-center space-x-1">
                        <X className="w-3.5 h-3.5" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Showing{' '}
                  <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–
                  <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong>{' '}
                  of <strong>{filtered.length}</strong> records
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentPage === page
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-extrabold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Reject Premium Upgrade</span>
            </div>
            <p className="text-xs text-slate-500">Provide an optional reason for rejecting this premium request.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unverified payment reference..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 h-24"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPremium(rejectingId)}
                disabled={processingId === rejectingId}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                {processingId === rejectingId ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
