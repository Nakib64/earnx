'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction, TransactionType } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useDebounce } from '../../../hooks/useDebounce';
import { DollarSign, Search, Filter, Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWalletPage() {
  const { admin } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Manual Adjustment Form State
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    setMsg(null);

    const res = await apiFetch('/admin/wallet/adjust', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        user_id: userId.trim(),
        amount: parseFloat(amount),
        description: description || 'Manual Admin Adjustment',
      }),
    });

    if (res.success) {
      toast.success('Wallet adjustment executed successfully!');
      setMsg({ type: 'success', text: 'Wallet adjusted successfully!' });
      setUserId('');
      setAmount('');
      setDescription('');
      await fetchTransactions();
    } else {
      toast.error(res.error?.message || 'Adjustment failed');
      setMsg({ type: 'error', text: res.error?.message || 'Adjustment failed' });
    }
    setAdjusting(false);
  };

  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'user',
      header: 'Member & Ref',
      render: (tx) => (
        <div>
          <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] truncate max-w-[130px] sm:max-w-[180px]">
            {tx.user?.phone || tx.user_id}
          </div>
          <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5 truncate max-w-[130px]">
            <span>{tx.user?.full_name || '-'}</span>
            {tx.user?.referral_code && <span className="text-[#005A36] font-bold">• {tx.user.referral_code}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'type_amount',
      header: 'Type & Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <StatusBadge status={tx.type} />
              <span className={`font-mono font-extrabold text-[11px] ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
              </span>
            </div>
            <div className="font-mono text-[9px] text-slate-400 font-medium truncate max-w-[130px]">
              ৳{Number(tx.balance_before).toFixed(1)} → ৳{Number(tx.balance_after).toFixed(1)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'description_date',
      header: 'Note & Date',
      align: 'right',
      render: (tx) => (
        <div className="text-right">
          <div className="text-slate-700 text-[10px] font-medium truncate max-w-[160px] sm:max-w-[240px] ml-auto">
            {tx.description || '-'}
          </div>
          <div className="text-slate-400 text-[9px] font-mono">{new Date(tx.created_at).toLocaleString()}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit & Transaction History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of all member wallet transactions with debounced search and filtering.
          </p>
        </div>

        <button
          onClick={() => {
            fetchTransactions();
            toast.info('Refreshed transaction log');
          }}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors self-start flex items-center space-x-1.5 text-xs font-bold"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {msg && <AlertBanner type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Manual Balance Adjustment Form */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200 w-full">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Issue Manual User Wallet Adjustment</span>
        </h3>

        <form onSubmit={handleAdjustSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              User ID / Target
            </label>
            <input
              type="text"
              required
              placeholder="UUID of target user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Adjustment Amount (+ / -)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 500 or -500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Audit Note / Reason
            </label>
            <input
              type="text"
              placeholder="Reason for adjustment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={adjusting}
            className="sky-gradient-btn py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
          >
            <span>{adjusting ? 'Processing...' : 'Execute Adjustment'}</span>
          </button>
        </form>
      </div>

      {/* Audit Filters Bar */}
      <div className="glass-card rounded-2xl p-4 bg-white border border-slate-200 space-y-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Debounced Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by phone, name, referral code, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Type Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="ALL">All Transaction Types</option>
              <option value={TransactionType.DEPOSIT}>DEPOSIT</option>
              <option value={TransactionType.WITHDRAW}>WITHDRAW</option>
              <option value={TransactionType.COMMISSION}>COMMISSION</option>
              <option value={TransactionType.PREMIUM_WEEKLY_PAYOUT}>PREMIUM_WEEKLY_PAYOUT</option>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
              title="Start Date"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
              title="End Date"
            />
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(searchTerm || selectedType !== 'ALL' || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Filtered Result Count: <strong className="text-slate-900">{totalRecords}</strong> transactions
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Global Transactions Audit Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Transaction Logs ({totalRecords})</h3>
          <span className="text-xs text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        <DataTable<WalletTransaction>
          data={transactions}
          columns={columns}
          keyExtractor={(tx) => tx.id}
          loading={loading}
          emptyMessage="No transaction logs match the selected filter criteria."
        />

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Show pages near current page
                if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold ${
                        page === pageNum
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
