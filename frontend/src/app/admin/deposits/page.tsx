'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  Clock,
  User,
  Settings,
  Edit3,
  Save,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  ArrowLeft,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useDebounce } from '../../../hooks/useDebounce';
import { toast } from 'sonner';

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
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

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

  // Approval modal
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean;
    deposit: DepositRequest | null;
    submitting: boolean;
  }>({
    isOpen: false,
    deposit: null,
    submitting: false,
  });

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

    const res = await apiFetch<any>(url, { isAdmin: true, skipCache: true, forceRefresh: true });
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

  const handleCopyTrx = (trxId: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedTrxId(trxId);
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  const handleSaveGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateways(true);
    const res = await apiFetch('/deposits/admin/gateways', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify(gatewayConfig),
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Gateway payment numbers and instructions updated successfully!' });
      setShowGatewayConfig(false);
      fetchGateways();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to update gateways' });
    }
    setSavingGateways(false);
  };

  const handleApproveConfirm = async () => {
    if (!approveModal.deposit) return;
    const targetDeposit = approveModal.deposit;
    setApproveModal((prev) => ({ ...prev, submitting: true }));

    const res = await apiFetch(`/deposits/admin/${targetDeposit.id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });

    if (res.success) {
      // Optimistically update table immediately
      setDeposits((prev) => {
        if (statusFilter === 'PENDING') {
          return prev.filter((d) => d.id !== targetDeposit.id);
        }
        return prev.map((d) =>
          d.id === targetDeposit.id
            ? { ...d, status: 'APPROVED' as any, approved_at: new Date().toISOString() }
            : d,
        );
      });
      setTotalCount((c) => Math.max(0, c - (statusFilter === 'PENDING' ? 1 : 0)));

      toast.success(`Deposit of ৳${targetDeposit.amount} approved & credited!`);
      setAlertMsg({
        type: 'success',
        text: `Deposit of ৳${targetDeposit.amount} approved and balance credited successfully!`,
      });
      setApproveModal({ isOpen: false, deposit: null, submitting: false });
      await fetchDeposits();
    } else {
      toast.error(res.error?.message || 'Failed to approve deposit');
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to approve deposit' });
      setApproveModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.deposit) return;
    const targetDeposit = rejectModal.deposit;

    setRejectModal((prev) => ({ ...prev, submitting: true }));
    const res = await apiFetch(`/deposits/admin/${targetDeposit.id}/reject`, {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ reason: rejectModal.reason }),
    });

    if (res.success) {
      // Optimistically update table immediately
      setDeposits((prev) => {
        if (statusFilter === 'PENDING') {
          return prev.filter((d) => d.id !== targetDeposit.id);
        }
        return prev.map((d) =>
          d.id === targetDeposit.id
            ? { ...d, status: 'REJECTED' as any, rejection_reason: rejectModal.reason }
            : d,
        );
      });
      setTotalCount((c) => Math.max(0, c - (statusFilter === 'PENDING' ? 1 : 0)));

      toast.success('Deposit request marked as rejected.');
      setAlertMsg({ type: 'success', text: 'Deposit request has been marked as rejected.' });
      setRejectModal({ isOpen: false, deposit: null, reason: '', submitting: false });
      await fetchDeposits();
    } else {
      toast.error(res.error?.message || 'Failed to reject deposit');
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to reject deposit' });
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Financial Operations &amp; Verification
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Deposit Management &amp; Gateways
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Verify manual bKash, Nagad, and Rocket mobile transactions, confirm TrxIDs, credit user wallets, and configure official payment accounts.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Verification Queue &bull;{' '}
                <strong className="text-slate-900 font-semibold">{totalCount} Total Records</strong>
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
              onClick={() => setShowGatewayConfig(!showGatewayConfig)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-[0.98] ${showGatewayConfig
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white/80 backdrop-blur-md border-white/90 text-slate-700 hover:bg-white'
                }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-500" />
              <span>Gateway Accounts</span>
            </button>

            <button
              onClick={fetchDeposits}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {alertMsg && (
          <AlertBanner
            type={alertMsg.type}
            message={alertMsg.text}
            onClose={() => setAlertMsg(null)}
          />
        )}

        {/* ── 2. GATEWAY CONFIGURATION CARD (Liquid Glassmorphism) ── */}
        {showGatewayConfig && (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 animate-in fade-in duration-200 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100/80 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Official Payment Gateways &amp; Member Instructions
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update phone numbers shown to users on their manual deposit checkout modal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGatewayConfig(false)}
                className="w-8 h-8 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGateways} className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {/* bKash Card */}
              <div className="bg-white/70 p-4 rounded-2xl border border-white/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    bKash Gateway
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Mobile Financial</span>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="bKash Number (017...)"
                    value={gatewayConfig.bkash_number}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, bkash_number: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-xs outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Account Type (e.g. Personal / Send Money)"
                    value={gatewayConfig.bkash_type}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, bkash_type: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* Nagad Card */}
              <div className="bg-white/70 p-4 rounded-2xl border border-white/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Nagad Gateway
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Post Office Digital</span>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Nagad Number (018...)"
                    value={gatewayConfig.nagad_number}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, nagad_number: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-xs outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Account Type (e.g. Personal / Send Money)"
                    value={gatewayConfig.nagad_type}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, nagad_type: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* Rocket Card */}
              <div className="bg-white/70 p-4 rounded-2xl border border-white/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Rocket Gateway
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Dutch-Bangla</span>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Rocket Number (019...)"
                    value={gatewayConfig.rocket_number}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, rocket_number: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-xs outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Account Type (e.g. Personal / Send Money)"
                    value={gatewayConfig.rocket_type}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, rocket_type: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notice & Instructions */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Checkout Instructions for Members</span>
                  <span className="text-[10px] text-slate-400 font-normal">Displayed directly above manual deposit field</span>
                </label>
                <textarea
                  rows={2}
                  value={gatewayConfig.deposit_instruction || ''}
                  onChange={(e) =>
                    setGatewayConfig({ ...gatewayConfig, deposit_instruction: e.target.value })
                  }
                  placeholder="Instructions shown to users on the deposit page..."
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200/90 focus:border-[#009F6B] rounded-xl text-xs font-medium outline-none transition-all shadow-2xs"
                />
              </div>

              <div className="md:col-span-3 flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingGateways}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#009F6B] hover:bg-[#008C5F] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
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

        {/* ── 3. SEARCH & STATUS FILTER BAR (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row gap-3.5 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search TrxID, sender phone, member name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/70 w-full md:w-auto overflow-x-auto">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-[0.98] ${statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
              >
                {tab === 'ALL'
                  ? 'All Deposits'
                  : tab === 'PENDING'
                    ? 'Pending Review'
                    : tab === 'APPROVED'
                      ? 'Approved'
                      : 'Rejected'}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. MAIN DEPOSITS TABLE CARD (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col justify-center items-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#009F6B]" />
              <p className="text-xs font-semibold text-slate-500">Loading deposit records...</p>
            </div>
          ) : deposits.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No deposit requests found</h3>
              <p className="text-xs text-slate-400">There are no deposit requests matching your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold text-[10.5px] border-b border-slate-100">
                    <th className="py-3.5 px-5">Member</th>
                    <th className="py-3.5 px-4">Gateway</th>
                    <th className="py-3.5 px-4">Sender Number</th>
                    <th className="py-3.5 px-4">Transaction ID (TrxID)</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date Submitted</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 font-medium text-slate-700">
                  {deposits.map((item) => (
                    <tr key={item.id} className="hover:bg-white/60 transition-colors">
                      {/* User Column */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] font-bold text-xs shrink-0">
                            {(item.user?.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {item.user?.full_name || 'Member'}
                            </p>
                            <p className="text-[11px] text-slate-400  mt-0.5">
                              {item.user?.phone || item.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.method?.toLowerCase() === 'bkash'
                              ? 'bg-pink-50 text-pink-700 border-pink-200/80'
                              : item.method?.toLowerCase() === 'nagad'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                : 'bg-purple-50 text-purple-700 border-purple-200/80'
                            }`}
                        >
                          {item.method}
                        </span>
                      </td>

                      {/* Sender Number */}
                      <td className="py-3.5 px-4  font-semibold text-slate-800">
                        {item.sender_number}
                      </td>

                      {/* TrxID */}
                      <td className="py-3.5 px-4  font-bold text-[#009F6B]">
                        <div className="inline-flex items-center gap-1.5 group cursor-pointer" onClick={() => handleCopyTrx(item.trx_id)}>
                          <span className="select-all">{item.trx_id}</span>
                          <button
                            type="button"
                            title="Copy TrxID"
                            className="text-slate-400 hover:text-emerald-700 p-0.5 rounded transition-colors"
                          >
                            {copiedTrxId === item.trx_id ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        ৳{Number(item.amount).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                        {item.rejection_reason && (
                          <p
                            className="text-[10px] text-rose-600 font-medium mt-1 max-w-xs truncate"
                            title={item.rejection_reason}
                          >
                            {item.rejection_reason}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(item.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {item.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setApproveModal({
                                  isOpen: true,
                                  deposit: item,
                                  submitting: false,
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                            >
                              <Check className="w-3 h-3" />
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
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : item.status === 'APPROVED' ? (
                          <span className="text-xs font-bold text-[#009F6B] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Credited</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 inline-flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
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
            <div className="p-4 border-t border-slate-100/80 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Total <strong className="text-slate-800">{totalCount}</strong> records (Page {page} of {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. APPROVE MODAL (Liquid Glassmorphism) ── */}
        {approveModal.isOpen && approveModal.deposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[26px] max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[#009F6B] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#009F6B]" />
                  <span>Approve Deposit Request</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setApproveModal({ isOpen: false, deposit: null, submitting: false })
                  }
                  className="w-8 h-8 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-emerald-50/80 border border-emerald-100/90 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Member:</span>
                  <span className="text-slate-900 font-bold">
                    {approveModal.deposit.user?.full_name || 'Member'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Sender Number:</span>
                  <span className=" font-semibold text-slate-800">
                    {approveModal.deposit.sender_number}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Gateway:</span>
                  <span className="font-bold text-slate-800 uppercase text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                    {approveModal.deposit.method}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">TrxID:</span>
                  <span className=" font-bold text-[#009F6B] select-all">
                    {approveModal.deposit.trx_id}
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-200/70 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Amount to Credit:</span>
                  <span className="text-xl font-extrabold text-[#009F6B]">
                    ৳{approveModal.deposit.amount}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Approving this request will immediately credit{' '}
                <strong className="text-slate-800 font-bold">৳{approveModal.deposit.amount}</strong> to{' '}
                <strong className="text-slate-800 font-bold">
                  {approveModal.deposit.user?.full_name || 'this member'}
                </strong>
                &apos;s wallet balance.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={approveModal.submitting}
                  onClick={() =>
                    setApproveModal({ isOpen: false, deposit: null, submitting: false })
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={approveModal.submitting}
                  onClick={handleApproveConfirm}
                  className="px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {approveModal.submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{approveModal.submitting ? 'Approving...' : 'Confirm & Credit Wallet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. REJECT MODAL (Liquid Glassmorphism) ── */}
        {rejectModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[26px] max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>Reject Deposit Request</span>
                </h3>
                <button
                  onClick={() =>
                    setRejectModal({ isOpen: false, deposit: null, reason: '', submitting: false })
                  }
                  className="w-8 h-8 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-rose-50/80 border border-rose-100 rounded-2xl text-xs space-y-1">
                <p className="text-rose-900 font-semibold">
                  Confirm rejection for Transaction ID:
                </p>
                <div className="flex justify-between items-center text-rose-950  font-bold text-sm">
                  <span>{rejectModal.deposit?.trx_id}</span>
                  <span className="text-slate-900 font-sans">৳{rejectModal.deposit?.amount}</span>
                </div>
              </div>

              <form onSubmit={handleRejectConfirm} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectModal.reason}
                    onChange={(e) =>
                      setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="e.g. Invalid TrxID, amount mismatch, duplicate submission..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-rose-500 rounded-xl text-xs font-medium outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setRejectModal({ isOpen: false, deposit: null, reason: '', submitting: false })
                    }
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejectModal.submitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {rejectModal.submitting ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
