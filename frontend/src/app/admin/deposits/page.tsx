'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { DepositRequest, DepositGatewayConfig } from '../../../types';
import {
  Wallet,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  TrendingDown,
  Clock,
  User,
  Settings,
  Edit3,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useDebounce } from '../../../hooks/useDebounce';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gateway configuration states
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState<DepositGatewayConfig>({
    bkash_number: '',
    bkash_type: '',
    nagad_number: '',
    nagad_type: '',
    rocket_number: '',
    rocket_type: '',
    deposit_instruction: '',
  });
  const [savingGateways, setSavingGateways] = useState(false);

  // Rejection modal
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    deposit: DepositRequest | null;
    reason: string;
    submitting: boolean;
  }>({
    isOpen: false,
    deposit: null,
    reason: '',
    submitting: false,
  });

  // Action state for approving
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchGateways = useCallback(async () => {
    const res = await apiFetch<DepositGatewayConfig>('/deposits/gateways', { isAdmin: true });
    if (res.success && res.data) {
      setGatewayConfig(res.data);
    }
  }, []);

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    let url = `/deposits/admin?page=${page}&limit=15`;
    if (debouncedSearch.trim()) {
      url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
    }
    if (statusFilter !== 'ALL') {
      url += `&status=${statusFilter}`;
    }

    const res = await apiFetch<any>(url, { isAdmin: true });
    if (res.success && res.data) {
      setDeposits(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalCount(res.data.meta?.total || 0);
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to load deposits' });
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleSaveGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateways(true);
    const res = await apiFetch('/deposits/admin/gateways', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify(gatewayConfig),
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Gateway numbers updated successfully!' });
      setShowGatewayConfig(false);
      fetchGateways();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to update gateways' });
    }
    setSavingGateways(false);
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this deposit and credit the user wallet?')) return;
    setApprovingId(id);
    const res = await apiFetch(`/deposits/admin/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Deposit approved and balance credited successfully!' });
      fetchDeposits();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to approve deposit' });
    }
    setApprovingId(null);
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.deposit) return;

    setRejectModal((prev) => ({ ...prev, submitting: true }));
    const res = await apiFetch(`/deposits/admin/${rejectModal.deposit.id}/reject`, {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ reason: rejectModal.reason }),
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Deposit request has been marked as rejected.' });
      setRejectModal({ isOpen: false, deposit: null, reason: '', submitting: false });
      fetchDeposits();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to reject deposit' });
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#005A36] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Deposit Management
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Verify manual bKash, Nagad, and Rocket deposit transactions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGatewayConfig(!showGatewayConfig)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Gateway Numbers</span>
          </button>
          <button
            onClick={fetchDeposits}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <AlertBanner
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg(null)}
        />
      )}

      {/* Gateway Configuration Drawer / Section */}
      {showGatewayConfig && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-inner animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#005A36]" />
              Update Official Deposit Numbers & Instructions
            </h2>
            <button
              onClick={() => setShowGatewayConfig(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveGateways} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* bKash */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-black text-pink-700 uppercase">bKash Gateway</span>
              <input
                type="text"
                placeholder="bKash Number"
                value={gatewayConfig.bkash_number}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, bkash_number: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
              />
              <input
                type="text"
                placeholder="Type (e.g. Personal Send Money)"
                value={gatewayConfig.bkash_type}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, bkash_type: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            {/* Nagad */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-black text-amber-700 uppercase">Nagad Gateway</span>
              <input
                type="text"
                placeholder="Nagad Number"
                value={gatewayConfig.nagad_number}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, nagad_number: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
              />
              <input
                type="text"
                placeholder="Type (e.g. Personal Send Money)"
                value={gatewayConfig.nagad_type}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, nagad_type: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            {/* Rocket */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-black text-purple-700 uppercase">Rocket Gateway</span>
              <input
                type="text"
                placeholder="Rocket Number"
                value={gatewayConfig.rocket_number}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, rocket_number: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
              />
              <input
                type="text"
                placeholder="Type (e.g. Personal Send Money)"
                value={gatewayConfig.rocket_type}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, rocket_type: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-black text-slate-700">Notice / Instructions for Users</label>
              <textarea
                rows={2}
                value={gatewayConfig.deposit_instruction || ''}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, deposit_instruction: e.target.value })
                }
                placeholder="Instructions shown to users on the deposit page..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingGateways}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#005A36] hover:bg-[#044D2F] text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingGateways ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Gateway Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search TrxID, phone, email, user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A36]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                statusFilter === tab
                  ? 'bg-[#005A36] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#005A36]" />
          </div>
        ) : deposits.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-black text-slate-600">No deposit requests found</p>
            <p className="text-xs text-slate-400">There are no deposit requests matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Sender Number</th>
                  <th className="py-3.5 px-4">Transaction ID (TrxID)</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {deposits.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Column */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-black text-slate-900">
                          {item.user?.full_name || 'Member'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {item.user?.phone || item.user?.email || 'N/A'}
                        </p>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 font-black">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-800 font-black">
                        {item.method}
                      </span>
                    </td>

                    {/* Sender */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.sender_number}
                    </td>

                    {/* TrxID */}
                    <td className="py-3.5 px-4 font-mono font-black text-[#005A36] select-all">
                      {item.trx_id}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ৳{Number(item.amount).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                      {item.rejection_reason && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5 max-w-xs truncate" title={item.rejection_reason}>
                          {item.rejection_reason}
                        </p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={approvingId === item.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {approvingId === item.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              setRejectModal({
                                isOpen: true,
                                deposit: item,
                                reason: '',
                                submitting: false,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-[11px] transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Total {totalCount} records (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Reject Deposit Request
              </h3>
              <button
                onClick={() =>
                  setRejectModal({ isOpen: false, deposit: null, reason: '', submitting: false })
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to reject TrxID{' '}
              <strong className="font-mono text-slate-900">{rejectModal.deposit?.trx_id}</strong> for amount{' '}
              <strong className="text-slate-900">৳{rejectModal.deposit?.amount}</strong>?
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Rejection Reason (Optional)</label>
                <textarea
                  rows={2}
                  value={rejectModal.reason}
                  onChange={(e) =>
                    setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="e.g. Invalid TrxID, amount mismatch, etc."
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setRejectModal({ isOpen: false, deposit: null, reason: '', submitting: false })
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectModal.submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {rejectModal.submitting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
