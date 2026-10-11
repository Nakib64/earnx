'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api';
import { UserInvestment, RequestStatus } from '../../../../types';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { AlertBanner } from '../../../../components/common/AlertBanner';
import {
  Users,
  Trash2,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  X,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function AdminInvestmentActionsPage() {
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Detail Modal
  const [viewInvestment, setViewInvestment] = useState<UserInvestment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiFetch<UserInvestment[]>('/investments/admin/all', { isAdmin: true });
    if (res.success && res.data) setInvestments(res.data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setMessage(null);
    const res = await apiFetch(`/investments/admin/investments/${id}/approve`, { method: 'POST', isAdmin: true });
    if (res.success) {
      setMessage({ type: 'success', text: 'Investment request approved successfully!' });
      setViewInvestment(null);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to approve' });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this investment request?')) return;
    setMessage(null);
    const res = await apiFetch(`/investments/admin/investments/${id}/reject`, { method: 'POST', isAdmin: true });
    if (res.success) {
      setMessage({ type: 'success', text: 'Investment request rejected.' });
      setViewInvestment(null);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to reject' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this investment record permanently?')) return;
    const res = await apiFetch(`/investments/admin/investments/${id}`, { method: 'DELETE', isAdmin: true });
    if (res.success) {
      setViewInvestment(null);
      fetchData();
    } else {
      alert(res.error?.message || 'Failed to delete');
    }
  };

  const filtered = investments.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (inv.user?.full_name || '').toLowerCase().includes(q) ||
      (inv.user?.phone || '').toLowerCase().includes(q) ||
      (inv.plan?.title || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = investments.filter((i) => i.status === RequestStatus.PENDING).length;
  const approvedCount = investments.filter((i) => i.status === RequestStatus.APPROVED).length;
  const rejectedCount = investments.filter((i) => i.status === RequestStatus.REJECTED).length;

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        
        {/* Header sitting directly on background */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Review &amp; Operations
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Investment Requests &amp; Approvals
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Verify pending investment activations, plan upgrade requests, and capital refund authorizations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link
              href="/admin/investments"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Packages</span>
            </Link>
          </div>
        </div>

        {message && (
          <AlertBanner
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* 3 KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-3.5 sm:gap-4 select-none">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
              {pendingCount}
            </span>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-xs font-semibold text-slate-500">Approved Portfolios</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
              {approvedCount}
            </span>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-xs font-semibold text-slate-500">Rejected / Closed</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-400 tabular-nums">
              {rejectedCount}
            </span>
          </div>
        </div>

        {/* Main List Section */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">All Investment Requests</h2>
                <p className="text-xs text-slate-500 font-normal">Audit and review member portfolios</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === f
                      ? f === 'PENDING'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : f === 'APPROVED'
                        ? 'bg-[#009F6B] text-white shadow-2xs'
                        : 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'ALL'
                    ? `All (${investments.length})`
                    : f === 'PENDING'
                    ? `Pending (${pendingCount})`
                    : f === 'APPROVED'
                    ? `Approved (${approvedCount})`
                    : `Rejected (${rejectedCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search member by name, phone, or package title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Member Details</th>
                  <th className="px-4 py-3">Package &amp; Capital</th>
                  <th className="px-4 py-3">Request Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      Loading investment records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      No investment requests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{inv.user?.full_name || 'Member'}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">{inv.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{inv.plan?.title || 'Custom Plan'}</div>
                        <div className="text-xs font-bold text-[#009F6B] tabular-nums">
                          ৳{Number(inv.amount).toLocaleString()} Capital
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {inv.request_type === 'UPGRADE' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Upgrade Request
                          </span>
                        ) : inv.request_type === 'WITHDRAWAL' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Capital Withdrawal
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            New Subscription
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setViewInvestment(inv)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {inv.status === RequestStatus.PENDING && (
                          <button
                            onClick={() => handleApprove(inv.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1 active:scale-[0.98]"
                          >
                            <span>Approve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View / Action Modal */}
        {viewInvestment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Investment Request Details</h3>
                    <p className="text-xs text-slate-500 font-normal">Audit investor and package terms</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewInvestment(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Investor Details Card */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Investor</span>
                <p className="font-bold text-slate-900 text-xs">{viewInvestment.user?.full_name || 'Anonymous'}</p>
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {viewInvestment.user?.phone}
                  {viewInvestment.user?.referral_code && (
                    <span className="text-[#009F6B] font-bold"> • Ref: {viewInvestment.user.referral_code}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={viewInvestment.status} />
                {viewInvestment.status === RequestStatus.PENDING && viewInvestment.request_type && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {viewInvestment.request_type === 'UPGRADE'
                      ? `Upgrade to ${viewInvestment.pending_plan?.title || 'New Plan'}`
                      : viewInvestment.request_type === 'WITHDRAWAL'
                      ? `Capital Refund: ৳${Number(viewInvestment.pending_amount || viewInvestment.amount || 0).toLocaleString()}`
                      : 'New Subscription'}
                  </span>
                )}
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Package</span>
                  <span className="font-bold text-slate-900">{viewInvestment.plan?.title || 'Plan'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invested</span>
                  <span className="font-bold text-[#009F6B] tabular-nums">
                    ৳{Number(viewInvestment.amount).toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Return</span>
                  <span className="font-bold text-[#009F6B] tabular-nums">
                    +{Number(viewInvestment.monthly_return_percent)}% / mo (৳{Number(viewInvestment.monthly_payout_amount).toLocaleString()})
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payout Progress</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {viewInvestment.total_payouts_made} / {viewInvestment.max_payouts || 12} Mo
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                {viewInvestment.status === RequestStatus.PENDING && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApprove(viewInvestment.id)}
                      className="py-2.5 px-4 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(viewInvestment.id)}
                      className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-amber-600" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDelete(viewInvestment.id)}
                    className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                  <button
                    onClick={() => setViewInvestment(null)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
