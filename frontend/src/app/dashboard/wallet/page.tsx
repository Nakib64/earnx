'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';

export default function WalletPage() {
  const { user, refreshUserProfile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal Form State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await apiFetch('/wallet/transactions?page=1&limit=50');
      setTransactions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      await apiFetch('/requests/withdrawal', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_details: paymentDetails,
        }),
      });

      setStatusMsg({
        type: 'success',
        text: 'Withdrawal request submitted! Sent to Admin approval queue.',
      });
      setAmount('');
      setPaymentDetails('');
      setShowWithdrawModal(false);
      await refreshUserProfile();
      await fetchTransactions();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to submit withdrawal request' });
    } finally {
      setSubmitting(false);
    }
  };

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

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-2 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

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
                  Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Account Details (bKash / Nagad / Bank)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bKash Personal 01700000000"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
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
            ${Number(user?.wallet_balance || 0).toFixed(2)}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl sky-gradient-bg flex items-center justify-center text-white shadow-lg">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Ledger Audit History</h3>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading ledger records...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No transactions recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Type</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Before / After</th>
                  <th className="pb-3 px-2">Description</th>
                  <th className="pb-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isCredit = Number(tx.amount) > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.type === 'COMMISSION'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'WITHDRAW'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold font-mono text-sm">
                        <span className={isCredit ? 'text-emerald-600' : 'text-red-600'}>
                          {isCredit ? '+' : ''}
                          ${Number(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 text-[11px]">
                        ${Number(tx.balance_before).toFixed(2)} → ${Number(tx.balance_after).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-slate-700 font-medium max-w-xs truncate">
                        {tx.description || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-[11px]">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
