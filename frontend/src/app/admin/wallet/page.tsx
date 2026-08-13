'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction, TransactionType } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useDebounce } from '../../../hooks/useDebounce';
import { Wallet, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, X, Calendar, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
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

  // 3-Column Table Definition
  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'user',
      header: 'Member',
      render: (tx) => (
        <div>
          <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] leading-tight truncate max-w-[120px] sm:max-w-[180px]">
            {tx.user?.full_name || tx.user?.phone || tx.user_id}
          </div>
          <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
            <span>{tx.user?.phone || tx.user_id}</span>
            {tx.user?.referral_code && <span className="text-primary font-bold hidden sm:inline">• {tx.user.referral_code}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'type_amount',
      header: 'Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className={`font-mono font-black text-[11px] ${isCredit ? 'text-[#005A36]' : 'text-rose-600'}`}>
                {isCredit ? '+' : ''}৳{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="font-mono text-[9px] text-slate-400 font-medium truncate max-w-[140px] hidden sm:block">
              ৳{Number(tx.balance_before).toFixed(1)} → ৳{Number(tx.balance_after).toFixed(1)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (tx) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTx(tx);
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 flex items-center space-x-1 text-[10px] font-extrabold ml-auto"
            title="View Transaction Details"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-secondary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Ledger & Transaction History
              </h1>
              <p className="text-xs text-emerald-100/80 font-medium">
                Complete audit log of all member deposits, withdrawals, payouts, and wallet adjustments.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchTransactions();
              toast.info('Refreshed transaction log');
            }}
            className="py-2 px-3 bg-emerald-700/50 hover:bg-emerald-700 text-white rounded-xl transition-colors text-xs font-extrabold flex items-center space-x-1.5 border border-emerald-500/30 shrink-0 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Audit Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Debounced Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by phone, name, referral code, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Type Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
              title="Start Date"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
              title="End Date"
            />
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(searchTerm || selectedType !== 'ALL' || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Filtered Records: <strong className="text-slate-900">{totalRecords}</strong> transactions
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-primary font-extrabold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Global Transactions Audit Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
            <span>Transaction Logs</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-primary border border-emerald-200 text-[10px] font-mono font-extrabold">
              {totalRecords} Total
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-mono font-extrabold">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <DataTable<WalletTransaction>
            data={transactions}
            columns={columns}
            keyExtractor={(tx) => tx.id}
            loading={loading}
            onRowClick={(tx) => setSelectedTx(tx)}
            emptyMessage="No transaction logs match the selected filter criteria."
          />
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-extrabold rounded-xl flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-slate-600 text-[11px] font-extrabold hidden sm:inline">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} total records)
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-extrabold rounded-xl flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-5 shadow-xl border border-slate-200/90">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Transaction Details</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {selectedTx.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Member Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Member</div>
                <div className="font-black text-slate-900 text-sm">{selectedTx.user?.full_name || 'Member'}</div>
                <div className="font-mono text-slate-600 font-bold flex items-center space-x-2">
                  <span>Phone: {selectedTx.user?.phone || selectedTx.user_id}</span>
                  {selectedTx.user?.referral_code && (
                    <>
                      <span>•</span>
                      <span className="text-primary">Code: {selectedTx.user.referral_code}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Transaction Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Type / Classification</div>
                  <div className="pt-0.5">
                    <StatusBadge status={selectedTx.type} />
                  </div>
                </div>

                <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Amount Payout</div>
                  <div className={`font-mono font-black text-sm ${Number(selectedTx.amount) >= 0 ? 'text-[#005A36]' : 'text-rose-600'}`}>
                    {Number(selectedTx.amount) >= 0 ? '+' : ''}৳{Number(selectedTx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Balance Before</div>
                  <div className="font-mono font-extrabold text-slate-700">
                    ৳{Number(selectedTx.balance_before || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Balance After</div>
                  <div className="font-mono font-black text-slate-900">
                    ৳{Number(selectedTx.balance_after || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Audit Description */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Note / Reason</div>
                <div className="font-bold text-slate-800">{selectedTx.description || 'No additional note provided.'}</div>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Timestamp: {new Date(selectedTx.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
