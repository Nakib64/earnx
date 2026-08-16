'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { WalletTransaction, TransactionType } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Wallet,
  Send,
  ArrowRightLeft,
  CheckCircle2,
  UserCheck,
  Loader2,
  MinusCircle,
  ShieldCheck,
  Search,
  AlertTriangle,
  FileText,
  User as UserIcon,
  Phone as PhoneIcon,
} from 'lucide-react';

interface RecipientSuggestion {
  id: string;
  full_name: string;
  phone: string;
  referral_code: string;
}

export default function WalletPage() {
  const { user, refreshUserProfile } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Audit History Filter State
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'BALANCE_TRANSFER' | 'WITHDRAW'>('ALL');

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Transfer State
  const [targetReferralCode, setTargetReferralCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  
  const [suggestions, setSuggestions] = useState<RecipientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingRecipient, setSearchingRecipient] = useState(false);
  const [verifiedRecipient, setVerifiedRecipient] = useState<RecipientSuggestion | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await apiFetch<any>('/wallet/transactions?page=1&limit=100');
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

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Suggestions when user inputs code/name/phone
  useEffect(() => {
    const code = targetReferralCode.trim();
    if (!code) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchingRecipient(false);
      if (!verifiedRecipient) {
        setRecipientName('');
        setRecipientPhone('');
        setRecipientError(null);
      }
      return;
    }

    // If already verified and user hasn't modified code, don't re-trigger search
    if (verifiedRecipient && verifiedRecipient.referral_code === code) {
      return;
    }

    setSearchingRecipient(true);
    setRecipientError(null);
    setVerifiedRecipient(null);
    setRecipientName('');
    setRecipientPhone('');

    const timer = setTimeout(async () => {
      const res = await apiFetch<RecipientSuggestion[]>(`/wallet/search-recipients?query=${encodeURIComponent(code)}`);

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSuggestions(res.data);
        setShowSuggestions(true);
        setRecipientError(null);

        // Auto-select exact referral code match if found in suggestions
        const exactMatch = res.data.find(
          (s) => s.referral_code.toUpperCase() === code.toUpperCase()
        );
        if (exactMatch) {
          selectRecipient(exactMatch);
        }
      } else {
        // Fallback: single recipient lookup
        const singleRes = await apiFetch<RecipientSuggestion>(
          `/wallet/verify-recipient?referral_code=${encodeURIComponent(code)}`
        );
        if (singleRes.success && singleRes.data) {
          setSuggestions([singleRes.data]);
          selectRecipient(singleRes.data);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setRecipientError('No user suggestion found for this user code. Transfer operation blocked.');
        }
      }
      setSearchingRecipient(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [targetReferralCode]);

  const selectRecipient = (userObj: RecipientSuggestion) => {
    setVerifiedRecipient(userObj);
    setTargetReferralCode(userObj.referral_code);
    setRecipientName(userObj.full_name);
    setRecipientPhone(userObj.phone);
    setShowSuggestions(false);
    setRecipientError(null);
  };

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
        note: transferNote.trim() || undefined,
      }),
    });

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Transferred ৳${amt.toLocaleString()} to ${verifiedRecipient.full_name} (${verifiedRecipient.phone}) directly!`,
      });
      setTargetReferralCode('');
      setRecipientName('');
      setRecipientPhone('');
      setTransferAmount('');
      setTransferNote('');
      setVerifiedRecipient(null);
      setShowTransferModal(false);
      await refreshUserProfile();
      await fetchTransactions();
    } else {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to complete balance transfer' });
    }
    setSubmittingTransfer(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const typeStr = String(tx.type);
    if (auditFilter === 'BALANCE_TRANSFER') {
      return typeStr === 'BALANCE_TRANSFER';
    }
    if (auditFilter === 'WITHDRAW') {
      return typeStr === 'WITHDRAW' || typeStr === 'WITHDRAWAL';
    }
    return true;
  });

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
            </div>

            <div className="flex items-baseline space-x-2 min-w-0">
              <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight truncate">
                ৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">Available BDT</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center shrink-0">
            <button
              onClick={() => {
                setShowTransferModal((prev) => !prev);
                setShowWithdrawModal(false);
                setAuditFilter('BALANCE_TRANSFER');
              }}
              className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer truncate ${
                showTransferModal
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="truncate">Direct Send</span>
            </button>

            <button
              onClick={() => {
                setShowWithdrawModal((prev) => !prev);
                setShowTransferModal(false);
                setAuditFilter('WITHDRAW');
              }}
              className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer truncate ${
                showWithdrawModal
                  ? 'bg-[#03442e] text-amber-200 border-2 border-amber-400'
                  : 'bg-[#023322] hover:bg-[#03442e] text-amber-200 border border-[#d4af37]/40'
              }`}
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
              {/* User Code Input with Autocomplete Suggestions */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient User Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search or enter referral code..."
                    value={targetReferralCode}
                    onChange={(e) => setTargetReferralCode(e.target.value.toUpperCase())}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchingRecipient && (
                    <div className="absolute right-3 top-3 text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                      Network Member Suggestions
                    </div>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectRecipient(item)}
                        className="w-full px-4 py-2.5 text-left hover:bg-emerald-50/80 transition-colors flex items-center justify-between space-x-2"
                      >
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 text-xs truncate">{item.full_name}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{item.phone}</p>
                        </div>
                        <span className="font-mono text-[11px] font-black text-primary bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                          {item.referral_code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Error / Blocked Status */}
                {recipientError && !verifiedRecipient && (
                  <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{recipientError}</span>
                  </div>
                )}
              </div>

              {/* Recipient Name (Auto-filled) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    placeholder="Selected user name..."
                    value={recipientName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 focus:outline-none cursor-not-allowed"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Recipient Phone (Auto-filled) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    placeholder="Selected user phone..."
                    value={recipientPhone}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-not-allowed"
                  />
                  <PhoneIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Transfer Amount */}
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

              {/* Optional Note Field */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Transfer Note (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter an optional note or reference..."
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Verified Recipient Card Badge */}
            {verifiedRecipient && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900">
                <UserCheck className="w-5 h-5 text-primary shrink-0" />
                <div className="text-xs min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">Recipient Verified: {verifiedRecipient.full_name}</p>
                  <p className="text-slate-600 font-medium truncate">Code: {verifiedRecipient.referral_code} | Phone: {verifiedRecipient.phone}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                submittingTransfer ||
                !verifiedRecipient ||
                !transferAmount ||
                parseFloat(transferAmount) <= 0 ||
                parseFloat(transferAmount) > currentBal
              }
              className="w-full py-3 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-extrabold text-slate-900 text-base truncate">Audit History</h3>
          </div>

          {/* Audit History Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setAuditFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                auditFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Logs
            </button>
            <button
              type="button"
              onClick={() => setAuditFilter('BALANCE_TRANSFER')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                auditFilter === 'BALANCE_TRANSFER'
                  ? 'bg-[#005A36] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Direct Transfers
            </button>
            <button
              type="button"
              onClick={() => setAuditFilter('WITHDRAW')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                auditFilter === 'WITHDRAW'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        <DataTable<WalletTransaction>
          data={filteredTransactions}
          columns={columns}
          keyExtractor={(tx) => tx.id}
          loading={loading}
        />
      </div>
    </div>
  );
}
