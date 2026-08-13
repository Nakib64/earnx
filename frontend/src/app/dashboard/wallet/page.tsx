'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Wallet, Send, ArrowRightLeft, CheckCircle2, UserCheck, Loader2 } from 'lucide-react';

export default function WalletPage() {
  const { user, refreshUserProfile } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Transfer State
  const [targetReferralCode, setTargetReferralCode] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [searchingRecipient, setSearchingRecipient] = useState(false);
  const [verifiedRecipient, setVerifiedRecipient] = useState<{
    id: string;
    full_name: string;
    phone: string;
    referral_code: string;
  } | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await apiFetch<any>('/wallet/transactions?page=1&limit=50');
    if (res.success && res.data) {
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

  // Live Recipient Verification when Referral Code changes
  useEffect(() => {
    const code = targetReferralCode.trim();
    if (!code) {
      setVerifiedRecipient(null);
      setRecipientError(null);
      setSearchingRecipient(false);
      return;
    }

    setSearchingRecipient(true);
    setRecipientError(null);
    setVerifiedRecipient(null);

    const timer = setTimeout(async () => {
      const res = await apiFetch<{
        id: string;
        full_name: string;
        phone: string;
        referral_code: string;
      }>(`/wallet/verify-recipient?referral_code=${encodeURIComponent(code)}`);

      if (res.success && res.data) {
        setVerifiedRecipient(res.data);
        setRecipientError(null);
      } else {
        setVerifiedRecipient(null);
        setRecipientError(res.error?.message || 'User not found in your network tree');
      }
      setSearchingRecipient(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [targetReferralCode]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWithdraw(true);
    setStatusMsg(null);

    const res = await apiFetch('/requests/withdrawal', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(withdrawAmount),
      }),
    });

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: 'Withdrawal completed successfully! Balance deducted.',
      });
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      await refreshUserProfile();
      await fetchTransactions();
    } else {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to process withdrawal' });
    }
    setSubmittingWithdraw(false);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedRecipient) return;

    setSubmittingTransfer(true);
    setStatusMsg(null);

    const amt = parseFloat(transferAmount);
    const res = await apiFetch<any>('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({
        target_referral_code: verifiedRecipient.referral_code,
        amount: amt,
      }),
    });

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Transferred ৳${amt.toLocaleString()} to ${verifiedRecipient.full_name} (${verifiedRecipient.phone}) directly!`,
      });
      setTargetReferralCode('');
      setTransferAmount('');
      setVerifiedRecipient(null);
      setShowTransferModal(false);
      await refreshUserProfile();
      await fetchTransactions();
    } else {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to complete balance transfer' });
    }
    setSubmittingTransfer(false);
  };

  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type_amount',
      header: 'Type & Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="flex items-center space-x-2">
            <StatusBadge status={tx.type} />
            <span className={`font-mono font-extrabold text-[11px] ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'balance',
      header: 'Before → After',
      render: (tx) => (
        <span className="font-mono text-[10px] text-slate-500 font-semibold truncate block max-w-[130px]">
          ৳{Number(tx.balance_before).toFixed(2)} → ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
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

  const currentBal = Number(user?.wallet_balance || 0);

  return (
    <div className="space-y-6">


      {statusMsg && <AlertBanner type={statusMsg.type} message={statusMsg.text} onClose={() => setStatusMsg(null)} />}

      {/* Network Transfer Modal / Form */}
      {showTransferModal && (
        <div className="glass-card rounded-none p-6 border-2 border-yellow-300 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-[#854D0E]" />
              <span>Direct Network Balance Transfer</span>
            </h3>
            <button
              onClick={() => setShowTransferModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Referral Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter referral code..."
                    value={targetReferralCode}
                    onChange={(e) => setTargetReferralCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-2.5 text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchingRecipient && (
                    <div className="absolute right-3 top-3 text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Live Recipient Info Status */}
                {searchingRecipient && (
                  <p className="text-xs text-primary font-medium mt-1.5 flex items-center space-x-1">
                    <span>Searching network tree...</span>
                  </p>
                )}

                {verifiedRecipient && (
                  <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-none flex items-center space-x-3 text-emerald-900">
                    <UserCheck className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-extrabold text-slate-900">{verifiedRecipient.full_name}</p>
                      <p className="text-slate-600 font-medium">{verifiedRecipient.phone}</p>
                    </div>
                  </div>
                )}

                {recipientError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1.5">{recipientError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Transfer Amount (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentBal}
                  required
                  placeholder="Enter amount..."
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">Available: ৳{currentBal.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingTransfer || !verifiedRecipient || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > currentBal}
              className="w-full py-3 rounded-none bg-primary hover:bg-[#044D2F] text-white font-extrabold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 shadow-xs border-b-2 border-secondary transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>{submittingTransfer ? 'Sending Transfer...' : 'Confirm & Direct Send'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Withdrawal Form Modal / Box */}
      {showWithdrawModal && (
        <div className="glass-card rounded-none p-6 border-2 border-emerald-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Submit Direct Withdrawal</h3>
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
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Withdrawal Amount (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentBal}
                  required
                  placeholder="500.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingWithdraw || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > currentBal}
              className="w-full emerald-gold-btn py-3 rounded-none font-extrabold text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submittingWithdraw ? 'Processing...' : 'Confirm & Withdraw'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Balance Summary Header */}
      <div className="glass-card rounded-none p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Available Wallet Balance</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            ৳{currentBal.toFixed(2)}
          </div>
        </div>
        <div className="w-12 h-12 rounded-none bg-primary border-b-2 border-secondary flex items-center justify-center text-secondary shadow-xs">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="glass-card rounded-none p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Ledger Audit History</h3>

        <DataTable<WalletTransaction>
          data={transactions}
          columns={columns}
          keyExtractor={(tx) => tx.id}
          loading={loading}
        />
      </div>
    </div>
  );
}
