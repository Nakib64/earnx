'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { DollarSign } from 'lucide-react';

export default function AdminWalletPage() {
  const { admin } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Form State
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await apiFetch<{ data: WalletTransaction[] }>('/admin/wallet/transactions?page=1&limit=50', {
      isAdmin: true,
    });
    if (res.success && res.data) {
      setTransactions((res.data as any).data || (Array.isArray(res.data) ? res.data : []));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchTransactions();
  }, [admin]);

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
      setMsg({ type: 'success', text: 'Wallet adjusted successfully!' });
      setUserId('');
      setAmount('');
      setDescription('');
      await fetchTransactions();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Adjustment failed' });
    }
    setAdjusting(false);
  };

  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'user',
      header: 'User',
      render: (tx) => (
        <div>
          <div className="font-bold text-slate-900">{tx.user?.phone || 'N/A'}</div>
          <div className="text-[10px] text-slate-400">{tx.user?.full_name || '-'}</div>
        </div>
      ),
    },
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
          <span className={`font-mono font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Before / After',
      render: (tx) => (
        <span className="font-mono text-[11px] text-slate-500">
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Ledger & Adjustments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit global wallet transactions across all members or issue manual balance adjustments
        </p>
      </div>

      {msg && <AlertBanner type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Manual Balance Adjustment Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Issue Manual User Wallet Adjustment</span>
        </h3>

        <form onSubmit={handleAdjustSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              User ID
            </label>
            <input
              type="text"
              required
              placeholder="UUID of target user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
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

      {/* Global Transactions Audit Table using DataTable */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm">Global System Transaction Audit Trail</h3>

        <DataTable<WalletTransaction>
          data={transactions}
          columns={columns}
          keyExtractor={(tx) => tx.id}
          loading={loading}
          emptyMessage="No system transactions recorded yet."
        />
      </div>
    </div>
  );
}
