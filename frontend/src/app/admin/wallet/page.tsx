'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { DollarSign, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';

export default function AdminWalletPage() {
  const { admin } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Form State
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const data = await apiFetch('/admin/wallet/transactions?page=1&limit=50', { isAdmin: true });
      setTransactions(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) fetchTransactions();
  }, [admin]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    setMsg(null);

    try {
      await apiFetch('/admin/wallet/adjust', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({
          user_id: userId.trim(),
          amount: parseFloat(amount),
          description: description || 'Manual Admin Adjustment',
        }),
      });

      setMsg('Wallet adjusted successfully!');
      setUserId('');
      setAmount('');
      setDescription('');
      await fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Ledger & Adjustments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit global wallet transactions across all members or issue manual balance adjustments
        </p>
      </div>

      {/* Manual Balance Adjustment Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Issue Manual User Wallet Adjustment</span>
        </h3>

        {msg && <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg">{msg}</div>}

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
              placeholder="e.g. 50 or -50"
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

      {/* Global Transactions Audit Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Global System Transaction Audit Trail</h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">User</th>
                  <th className="pb-3 px-2">Type</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Before / After</th>
                  <th className="pb-3 px-2">Description</th>
                  <th className="pb-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">{tx.user?.phone}</div>
                      <div className="text-[10px] text-slate-400">{tx.user?.full_name || '-'}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold">
                      ${Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 font-mono text-[11px] text-slate-500">
                      ${Number(tx.balance_before).toFixed(2)} → ${Number(tx.balance_after).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-slate-700">{tx.description || '-'}</td>
                    <td className="py-3 px-2 text-slate-400 text-[11px]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
