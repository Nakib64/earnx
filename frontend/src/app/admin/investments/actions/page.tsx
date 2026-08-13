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
      setMessage({ type: 'success', text: 'Investment approved successfully!' });
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
      setMessage({ type: 'success', text: 'Investment rejected.' });
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Back Link */}
      <Link
        href="/admin/investments"
        className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-400 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Investments</span>
      </Link>

      {/* Theme Green Banner Header */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">User Investment Actions</h1>
            <p className="text-xs text-emerald-100/80 font-medium">Approve, reject, and manage all user investment records.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-[#854D0E] font-mono">{pendingCount}</div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Pending</div>
        </div>
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-primary font-mono">{approvedCount}</div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Approved</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-slate-400 font-mono">{rejectedCount}</div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Rejected</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">All Investments</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
                  statusFilter === f
                    ? f === 'PENDING'
                      ? 'bg-amber-100 text-[#854D0E] border border-amber-300'
                      : f === 'APPROVED'
                      ? 'bg-[#005A36] text-white'
                      : f === 'REJECTED'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-[#005A36] text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f === 'ALL' ? `All (${investments.length})` : f === 'PENDING' ? `Pending (${pendingCount})` : f === 'APPROVED' ? `Approved (${approvedCount})` : `Rejected (${rejectedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by user name, phone, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
          />
        </div>

        {/* Minimal Clean Table (compact, no x-scroll) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-2.5 py-2">User</th>
                <th className="px-2.5 py-2">Plan & Status</th>
                <th className="px-2.5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400 text-xs">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400 text-xs">No investments found.</td></tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2.5 py-2">
                      <p className="font-extrabold text-slate-900 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px]">{inv.user?.full_name || inv.user?.phone || 'User'}</p>
                      <p className="text-slate-500 font-mono text-[9px]">{inv.user?.phone}</p>
                    </td>
                    <td className="px-2.5 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-extrabold text-slate-900 text-[10px] sm:text-xs">{inv.plan?.title || 'Plan'}</span>
                        <StatusBadge status={inv.status} />
                        {inv.status === RequestStatus.PENDING && inv.request_type && (
                          <span className="text-[7.5px] font-extrabold text-[#854D0E] bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                            {inv.request_type === 'UPGRADE' ? 'Upgrade' : inv.request_type === 'WITHDRAWAL' ? 'Withdraw' : 'New'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2.5 py-2 text-right">
                      <button
                        onClick={() => setViewInvestment(inv)}
                        className="py-1 px-2.5 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-[9px] sm:text-[10px] rounded-lg shadow-xs transition-all inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3 text-secondary" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Action Modal */}
      {viewInvestment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl border border-slate-200/90 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Investment Details</h3>
              </div>
              <button onClick={() => setViewInvestment(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Investor Card */}
            <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Investor</span>
              <p className="font-extrabold text-slate-900 text-sm">{viewInvestment.user?.full_name || 'Anonymous'}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {viewInvestment.user?.phone}
                {viewInvestment.user?.referral_code && <span className="text-primary font-bold"> • {viewInvestment.user.referral_code}</span>}
              </p>
            </div>

            {/* Status & Request Type */}
            <div className="flex items-center gap-2">
              <StatusBadge status={viewInvestment.status} />
              {viewInvestment.status === RequestStatus.PENDING && viewInvestment.request_type && (
                <span className="text-[10px] font-extrabold text-[#854D0E] bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  {viewInvestment.request_type === 'UPGRADE'
                    ? `Upgrade to ${viewInvestment.pending_plan?.title || 'New Plan'} (৳${Number(viewInvestment.pending_amount || 0).toLocaleString()})`
                    : viewInvestment.request_type === 'WITHDRAWAL'
                    ? `Withdraw Capital: ৳${Number(viewInvestment.pending_amount || 0).toLocaleString()}`
                    : 'New Package Request'}
                </span>
              )}
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Plan</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{viewInvestment.plan?.title || 'Plan'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Invested</p>
                <p className="text-sm font-black text-primary font-mono mt-0.5">৳{Number(viewInvestment.amount).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Monthly Return</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{Number(viewInvestment.monthly_return_percent)}%</p>
                <p className="text-[10px] font-extrabold text-primary font-mono">৳{Number(viewInvestment.monthly_payout_amount).toLocaleString()}/mo</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Payouts</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {viewInvestment.total_payouts_made}
                  {!(viewInvestment.is_lifetime || viewInvestment.plan?.is_lifetime) && <span className="text-slate-400 font-medium"> / {viewInvestment.max_payouts || 12}</span>}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 font-mono">
              <div>
                <span className="font-extrabold text-slate-400 uppercase tracking-wider block">Created</span>
                {viewInvestment.created_at ? new Date(viewInvestment.created_at).toLocaleDateString() : '-'}
              </div>
              <div>
                <span className="font-extrabold text-slate-400 uppercase tracking-wider block">Next Payout</span>
                {viewInvestment.next_payout_at ? new Date(viewInvestment.next_payout_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              {viewInvestment.status === RequestStatus.PENDING && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleApprove(viewInvestment.id)}
                    className="py-2.5 px-4 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(viewInvestment.id)}
                    className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-[#854D0E] font-extrabold text-xs rounded-xl border border-amber-200 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDelete(viewInvestment.id)}
                  className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setViewInvestment(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
