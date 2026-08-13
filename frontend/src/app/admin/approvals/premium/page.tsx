'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ApprovalsHeader from '../../../../components/approvals/ApprovalsHeader';
import { apiFetch } from '../../../../lib/api';
import { AlertBanner } from '../../../../components/common/AlertBanner';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import {
  Star,
  Check,
  X,
  Search,
  Filter,
  ShieldAlert,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PremiumRecord {
  id: string;
  user_id: string;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string | null;
    phone: string;
    referral_code: string;
    status: string;
    referred_by?: {
      id: string;
      full_name: string | null;
      phone: string;
    } | null;
  };
}

const ITEMS_PER_PAGE = 10;

export default function PremiumApprovalPage() {
  const [premiumReqs, setPremiumReqs] = useState<PremiumRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Count for tabs
  const [pendingActivationCount, setPendingActivationCount] = useState(0);

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reject Modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPremiumReqs = async () => {
    setLoading(true);
    const res = await apiFetch<PremiumRecord[]>('/admin/approvals/premium', { isAdmin: true });
    if (res.success && res.data) {
      setPremiumReqs(res.data);
    }
    setLoading(false);
  };

  const fetchTabCounts = async () => {
    const resAct = await apiFetch<any[]>('/admin/approvals/activations', { isAdmin: true });
    if (resAct.success && resAct.data) {
      setPendingActivationCount(resAct.data.filter((r) => r.status === 'PENDING').length);
    }
  };

  useEffect(() => {
    fetchPremiumReqs();
    fetchTabCounts();
  }, []);

  const handleApprovePremium = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/approvals/premium/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMsg({ type: 'success', text: 'Premium upgrade approved successfully! Multi-level commissions distributed.' });
      fetchPremiumReqs();
      fetchTabCounts();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Failed to approve premium upgrade' });
    }
    setProcessingId(null);
  };

  const handleRejectPremium = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/approvals/premium/${id}/reject`, {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ reason: rejectReason }),
    });
    if (res.success) {
      setMsg({ type: 'success', text: 'Premium upgrade request rejected.' });
      setRejectingId(null);
      setRejectReason('');
      fetchPremiumReqs();
      fetchTabCounts();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Failed to reject premium upgrade' });
    }
    setProcessingId(null);
  };

  // Filter logic
  const filtered = useMemo(() => {
    return premiumReqs.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase().trim();
      const userName = req.user?.full_name?.toLowerCase() || '';
      const userPhone = req.user?.phone?.toLowerCase() || '';
      const refCode = req.user?.referral_code?.toLowerCase() || '';
      const sponsorName = req.user?.referred_by?.full_name?.toLowerCase() || '';
      const sponsorPhone = req.user?.referred_by?.phone?.toLowerCase() || '';
      return (
        userName.includes(term) ||
        userPhone.includes(term) ||
        refCode.includes(term) ||
        sponsorName.includes(term) ||
        sponsorPhone.includes(term)
      );
    });
  }, [premiumReqs, statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const pendingPremiumCount = useMemo(
    () => premiumReqs.filter((r) => r.status === 'PENDING').length,
    [premiumReqs],
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <ApprovalsHeader
        activationCount={pendingActivationCount}
        premiumCount={pendingPremiumCount}
      />

      {msg && <AlertBanner type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* PREMIUM REQUESTS HISTORY & QUEUE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#854D0E] shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <span>Premium Upgrade Requests</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-[#854D0E] border border-amber-200 text-[10px] font-mono font-extrabold">
                  {filtered.length}
                </span>
              </h3>
              <p className="text-[11px] font-medium text-slate-400">All historical premium upgrade records</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, phone, code, or sponsor..."
              className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all w-full sm:w-auto"
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
          <div className="text-xs text-slate-400 py-10 text-center font-extrabold animate-pulse">Loading premium records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-xs text-slate-400 py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 font-extrabold">
            {search || statusFilter !== 'ALL'
              ? 'No records matching your search/filter criteria.'
              : 'No premium upgrade records found.'}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginated.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {req.user?.full_name || req.user?.phone}
                      </span>
                      <StatusBadge status={req.status as any} />
                    </div>
                    <div className="text-xs text-slate-500 font-mono space-x-3">
                      <span>Phone: <strong className="text-slate-800">{req.user?.phone}</strong></span>
                      <span>•</span>
                      <span>Code: <strong className="text-primary font-bold">{req.user?.referral_code}</strong></span>
                      <span>•</span>
                      <span className="text-slate-400 font-sans">
                        Requested: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {req.user?.referred_by && (
                      <div className="text-xs text-slate-600 font-medium flex items-center space-x-1 pt-0.5">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span>
                          Sponsor:{' '}
                          <strong className="text-slate-800">{req.user.referred_by.full_name || req.user.referred_by.phone}</strong>
                        </span>
                      </div>
                    )}
                    {req.rejection_reason && (
                      <div className="text-xs text-rose-600 font-medium pt-1">
                        Reason: {req.rejection_reason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleApprovePremium(req.id)}
                          disabled={processingId === req.id}
                          className="py-2 px-4 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl shadow-sm disabled:opacity-60 transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-secondary" />
                          <span>{processingId === req.id ? 'Processing...' : 'Approve & Pay Commission'}</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(req.id)}
                          disabled={processingId === req.id}
                          className="bg-amber-50 hover:bg-amber-100 text-[#854D0E] border border-amber-200 px-3 py-2 rounded-xl text-xs font-extrabold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : req.status === 'APPROVED' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-primary font-extrabold text-xs border border-emerald-200 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-extrabold text-xs border border-slate-200 flex items-center space-x-1">
                        <X className="w-3.5 h-3.5" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Showing{' '}
                  <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–
                  <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong>{' '}
                  of <strong>{filtered.length}</strong> records
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 font-mono">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                          currentPage === page
                            ? 'bg-[#005A36] text-white shadow-xs'
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
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-black text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Reject Premium Request</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Provide an optional reason for rejecting this premium upgrade.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unverified transaction..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 h-24"
            />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-extrabold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPremium(rejectingId)}
                disabled={processingId === rejectingId}
                className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-sm transition-all"
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
