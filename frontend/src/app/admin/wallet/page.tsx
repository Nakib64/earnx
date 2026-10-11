'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction, TransactionType } from '../../../types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Wallet,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Sparkles,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWalletPage() {
  const { admin } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Transaction Modal
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);

    const queryParts = [`page=${page}`, `limit=25`];
    if (debouncedSearch.trim()) queryParts.push(`search=${encodeURIComponent(debouncedSearch.trim())}`);
    if (selectedType && selectedType !== 'ALL') queryParts.push(`type=${selectedType}`);
    if (startDate) queryParts.push(`start_date=${startDate}`);
    if (endDate) queryParts.push(`end_date=${endDate}`);

    const res = await apiFetch<any>(`/admin/wallet/transactions?${queryParts.join('&')}`, {
      isAdmin: true,
    });

    if (res.success && res.data) {
      const txData = res.data.data || (Array.isArray(res.data) ? res.data : []);
      const meta = res.data.meta || {};
      setTransactions(txData);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.total || txData.length);
    } else {
      setTransactions([]);
    }
    setLoading(false);
  }, [page, debouncedSearch, selectedType, startDate, endDate]);

  useEffect(() => {
    if (admin) fetchTransactions();
  }, [admin, fetchTransactions]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedType, startDate, endDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTransactions();
      toast.info('Refreshed wallet transaction log');
    } catch {
      toast.error('Failed to refresh transactions');
    } finally {
      setRefreshing(false);
    }
  };

  // Quick calculations for the KPI cards from current transaction list
  const kpiStats = useMemo(() => {
    let creditSum = 0;
    let debitSum = 0;
    transactions.forEach((tx) => {
      const amt = Number(tx.amount || 0);
      if (amt >= 0) creditSum += amt;
      else debitSum += Math.abs(amt);
    });
    return { creditSum, debitSum };
  }, [transactions]);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">

        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl select-none">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Financial Audit &amp; Ledger Governance
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Wallet &amp; Transaction Logs
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Complete audit ledger of all member deposits, withdrawals, commissions, investments, and wallet balance adjustments.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Ledger Audit Stream &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {totalRecords} Total Records Audited
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap select-none">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Transaction Log"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading || refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 2. SUMMARY KPI STATS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 select-none">
          {/* Card 1: Total Records */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Records</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {totalRecords}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                All-time audited operations
              </span>
            </div>
          </div>

          {/* Card 2: Page Inflows */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Page Credits (+)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums truncate block">
                +৳{kpiStats.creditSum.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Current batch credit volume
              </span>
            </div>
          </div>

          {/* Card 3: Page Debits */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Page Debits (-)</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums truncate block">
                -৳{kpiStats.debitSum.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Current batch debit volume
              </span>
            </div>
          </div>

          {/* Card 4: Filter Classification */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Scope</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Filter className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 truncate block">
                {selectedType === 'ALL' ? 'All Operations' : selectedType}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. AUDIT FILTERS BAR ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3 select-none">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Debounced Search */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by phone, name, referral code, or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Type Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Transaction Types</option>
                <option value={TransactionType.DEPOSIT}>DEPOSIT</option>
                <option value={TransactionType.WITHDRAW}>WITHDRAW</option>
                <option value={TransactionType.COMMISSION}>COMMISSION</option>
                <option value={TransactionType.PREMIUM_DAILY_REWARD}>PREMIUM_DAILY_REWARD</option>
                <option value={TransactionType.INVESTMENT_DEPOSIT}>INVESTMENT_DEPOSIT</option>
                <option value={TransactionType.INVESTMENT_PAYOUT}>INVESTMENT_PAYOUT</option>
                <option value={TransactionType.ADMIN_ADJUSTMENT}>ADMIN_ADJUSTMENT</option>
              </select>
            </div>

            {/* Date Range Pickers */}
            <div className="sm:col-span-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs cursor-pointer"
                title="Start Date"
              />
            </div>

            <div className="sm:col-span-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs cursor-pointer"
                title="End Date"
              />
            </div>
          </div>

          {/* Active Filters Summary & Reset */}
          {(searchTerm || selectedType !== 'ALL' || startDate || endDate) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
              <span className="text-slate-500 font-medium">
                Filtered Results: <strong className="text-slate-900">{totalRecords}</strong> matching transactions
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-[#009F6B] font-bold hover:underline cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* ── 4. GLOBAL TRANSACTIONS AUDIT TABLE ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Audited Ledger Entries
                </h3>
                <p className="text-xs text-slate-400 font-medium">Click any row to inspect full transaction ledger parameters</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
                {totalRecords} Total Records
              </span>
              <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                Page {page} of {totalPages}
              </span>
            </div>
          </div>

          {/* Styled Table Wrapper */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Member Account</th>
                  <th className="px-4 py-3.5">Classification</th>
                  <th className="px-4 py-3.5">Amount &amp; Balance Flow</th>
                  <th className="px-4 py-3.5">Date &amp; Time</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white/40 font-medium text-slate-700">
                {loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#009F6B]" />
                      <span className="text-xs font-semibold">Loading ledger transactions...</span>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      No transaction records match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = Number(tx.amount) >= 0;
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Member */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-[#009F6B] flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                              {(tx.user?.full_name || tx.user?.phone || 'M').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#009F6B] transition-colors text-xs leading-tight">
                                {tx.user?.full_name || tx.user?.phone || tx.user_id}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium flex items-center space-x-1.5 mt-0.5">
                                <span>{tx.user?.phone || tx.user_id}</span>
                                {tx.user?.referral_code && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#009F6B] font-bold">{tx.user.referral_code}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={tx.type} />
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5">
                          <div>
                            <span className={`font-bold text-xs tabular-nums ${isCredit ? 'text-[#009F6B]' : 'text-rose-600'}`}>
                              {isCredit ? '+' : ''}৳{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div className="text-[10px] text-slate-400 font-medium tabular-nums mt-0.5">
                              ৳{Number(tx.balance_before || 0).toFixed(1)} &rarr; ৳{Number(tx.balance_after || 0).toFixed(1)}
                            </div>
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(tx.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(tx);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#009F6B] rounded-xl transition-colors border border-slate-200/80 flex items-center gap-1 text-[11px] font-bold ml-auto cursor-pointer"
                            title="View Transaction Ledger Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer active:scale-[0.98]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-slate-600 text-[11px] font-medium hidden sm:inline">
                Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalRecords} total records)
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer active:scale-[0.98]"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── 5. TRANSACTION DETAILS MODAL ── */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-5 shadow-2xl border border-white/90 select-none">
              <div className="flex items-center justify-between border-b border-slate-100/80 pb-3.5">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Transaction Ledger Details</h3>
                    <p className="text-[10px] text-slate-400  truncate max-w-[200px]">ID: {selectedTx.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Member Card */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Member</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedTx.user?.full_name || 'Member'}</div>
                  <div className="text-slate-600 font-medium flex items-center space-x-2 text-xs">
                    <span>Phone: {selectedTx.user?.phone || selectedTx.user_id}</span>
                    {selectedTx.user?.referral_code && (
                      <>
                        <span>•</span>
                        <span className="text-[#009F6B] font-bold">Code: {selectedTx.user.referral_code}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Transaction Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classification</div>
                    <div className="pt-0.5">
                      <StatusBadge status={selectedTx.type} />
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100/90 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#009F6B]">Amount Payout</div>
                    <div className={`font-bold text-sm ${Number(selectedTx.amount) >= 0 ? 'text-[#009F6B]' : 'text-rose-600'}`}>
                      {Number(selectedTx.amount) >= 0 ? '+' : ''}৳{Number(selectedTx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance Before</div>
                    <div className="font-bold text-slate-700 tabular-nums">
                      ৳{Number(selectedTx.balance_before || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance After</div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      ৳{Number(selectedTx.balance_after || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Audit Description */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Note / Reason</div>
                  <div className="font-semibold text-slate-800">{selectedTx.description || 'No additional note provided.'}</div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Timestamp: {new Date(selectedTx.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
