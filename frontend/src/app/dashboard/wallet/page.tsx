'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Wallet, Send, ArrowRightLeft, CheckCircle2, UserCheck, Loader2, MinusCircle, ShieldCheck } from 'lucide-react';

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
          <div className="flex items-center space-x-2 min-w-0">
            <StatusBadge status={tx.type} />
            <span className={`font-mono font-extrabold text-[11px] truncate ${isCredit ? 'text-[#005A36]' : 'text-rose-700'}`}>
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
        <div className="text-right min-w-0">
          <div className="text-slate-700 text-[10px] font-semibold truncate max-w-[140px] sm:max-w-[240px] ml-auto">
            {tx.description || '-'}
          </div>
          <div className="text-slate-400 text-[9px] font-mono truncate">{new Date(tx.created_at).toLocaleString()}</div>
        </div>
      ),
    },
  ];

  const currentBal = Number(user?.wallet_balance || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {statusMsg && <AlertBanner type={statusMsg.type} message={statusMsg.text} onClose={() => setStatusMsg(null)} />}

      {/* Full-Width Hero Wallet Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          {/* Balance info */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="bg-white/10 border border-[#d4af37]/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-200">
                Main Wallet Balance
              </span>
              <span className="bg-[#023322] border border-[#d4af37]/40 px-2.5 py-0.5 rounded-full text-[10px] font-black text-amber-300">
                ACID Ledger
              </span>
            </div>

            <div className="flex items-baseline space-x-2 min-w-0">
              <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight truncate">
                ৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">Available BDT</span>
            </div>

            <p className="text-xs text-slate-300 font-semibold truncate">
              Instant multi-level payouts, package dividends, and network transfer balance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center shrink-0">
            <button
              onClick={() => {
                setShowTransferModal((prev) => !prev);
                setShowWithdrawModal(false);
              }}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer truncate"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="truncate">Direct Send</span>
            </button>

            <button
              onClick={() => {
                setShowWithdrawModal((prev) => !prev);
                setShowTransferModal(false);
              }}
              className="bg-[#023322] hover:bg-[#03442e] text-amber-200 border border-[#d4af37]/40 px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer truncate"
            >
              <MinusCircle className="w-4 h-4 text-[#f3ba2f] shrink-0" />
              <span className="truncate">Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network Transfer Modal / Form */}
      {showTransferModal && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-300 space-y-4 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2 truncate">
              <ArrowRightLeft className="w-5 h-5 text-[#854D0E] shrink-0" />
              <span className="truncate">Direct Network Balance Transfer</span>
            </h3>
            <button
              onClick={() => setShowTransferModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 shrink-0"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900">
                    <UserCheck className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-xs min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">{verifiedRecipient.full_name}</p>
                      <p className="text-slate-600 font-medium truncate">{verifiedRecipient.phone}</p>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">Available: ৳{currentBal.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingTransfer || !verifiedRecipient || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > currentBal}
              className="w-full py-3 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>{submittingTransfer ? 'Sending Transfer...' : 'Confirm & Direct Send'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Withdrawal Form Modal / Box */}
      {showWithdrawModal && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-200 space-y-4 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base truncate">Submit Direct Withdrawal</h3>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 shrink-0"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingWithdraw || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > currentBal}
              className="w-full bg-[#005A36] hover:bg-[#044D2F] text-white py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-secondary shrink-0" />
              <span>{submittingWithdraw ? 'Processing...' : 'Confirm & Withdraw'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm overflow-hidden">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-slate-900 text-base truncate">Ledger Audit History</h3>
        </div>

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
