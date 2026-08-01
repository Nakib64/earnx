'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Wallet, Send } from 'lucide-react';

export default function WalletPage() {
  const { user, refreshUserProfile } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal Form State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await apiFetch<any>('/wallet/transactions?page=1&limit=50');
    if (res.success && res.data) {
      // Backend may return paginated shape { data: [...] } or { transactions: [...] } or a raw array
      const raw = res.data;
      const list: WalletTransaction[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.transactions)
        ? raw.transactions
        : [];
      setTransactions(list);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const res = await apiFetch('/requests/withdrawal', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(amount),
      }),
    });

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: 'Withdrawal request submitted! Sent to Admin approval queue.',
      });
      setAmount('');
      setShowWithdrawModal(false);
      await refreshUserProfile();
      await fetchTransactions();
    } else {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to submit withdrawal request' });
    }
    setSubmitting(false);
  };

  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (tx) => <StatusBadge status={tx.type} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <span className={`font-bold font-mono text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Before / After',
      render: (tx) => (
        <span className="font-mono text-slate-500 text-[11px]">
          ৳{Number(tx.balance_before).toFixed(2)} → ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (tx) => <span className="text-slate-700 font-medium max-w-xs truncate">{tx.description || '-'}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      align: 'right',
      render: (tx) => <span className="text-slate-400 text-[11px]">{new Date(tx.created_at).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wallet & Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable transaction ledger backed by ACID database integrity
          </p>
        </div>

        <button
          onClick={() => setShowWithdrawModal(!showWithdrawModal)}
          className="sky-gradient-btn px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
        >
          <Send className="w-4 h-4" />
          <span>Request Withdrawal</span>
        </button>
      </div>

      {statusMsg && <AlertBanner type={statusMsg.type} message={statusMsg.text} onClose={() => setStatusMsg(null)} />}

      {/* Withdrawal Form Modal / Box */}
      {showWithdrawModal && (
        <div className="glass-card rounded-2xl p-6 border-2 border-sky-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Submit Direct Withdrawal Request</h3>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Withdrawal Amount (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sky-gradient-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Submitting...' : 'Submit to Admin Queue'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Balance Summary Header */}
      <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Available Wallet Balance</span>
          <div className="text-3xl font-extrabold text-slate-900">
            ৳{Number(user?.wallet_balance || 0).toFixed(2)}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl sky-gradient-bg flex items-center justify-center text-white shadow-lg">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Ledger Audit History</h3>

        <DataTable<WalletTransaction>
          data={transactions}
          columns={columns}
          keyExtractor={(tx) => tx.id}
          loading={loading}
          emptyMessage="No transactions recorded yet in your wallet ledger."
        />
      </div>
    </div>
  );
}
