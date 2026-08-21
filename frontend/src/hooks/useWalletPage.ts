'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { WalletTransaction } from '../types';
import { useDebounce } from './useDebounce';

export interface RecipientSuggestion {
  id: string;
  full_name: string | null;
  email?: string | null;
  phone: string;
  referral_code: string;
  status?: string;
  is_premium?: boolean;
}

export function useWalletPage() {
  const { user, refreshUserProfile } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form display state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Audit History Filter State
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'BALANCE_TRANSFER' | 'WITHDRAW'>('ALL');

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Transfer State
  const [targetReferralCode, setTargetReferralCode] = useState('');
  const debouncedTargetCode = useDebounce(targetReferralCode, 300);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
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

  // Fetch Suggestions with Debounced search query
  useEffect(() => {
    const code = debouncedTargetCode.trim();
    if (!code) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchingRecipient(false);
      return;
    }

    // If query matches the selected user, keep dropdown closed
    if (
      verifiedRecipient &&
      verifiedRecipient.referral_code.toLowerCase() === code.toLowerCase()
    ) {
      setShowSuggestions(false);
      setSearchingRecipient(false);
      return;
    }

    setSearchingRecipient(true);
    setRecipientError(null);

    (async () => {
      const res = await apiFetch<any>(
        `/users/search-by-code?q=${encodeURIComponent(code)}&code_only=true`,
      );

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSuggestions(res.data);
        setShowSuggestions(true);
        setRecipientError(null);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setRecipientError('No member found with this user code.');
      }
      setSearchingRecipient(false);
    })();
  }, [debouncedTargetCode, verifiedRecipient]);

  const selectRecipient = (userObj: RecipientSuggestion) => {
    setVerifiedRecipient(userObj);
    setTargetReferralCode(userObj.referral_code);
    setRecipientName(userObj.full_name || '');
    setRecipientPhone(userObj.phone || '');
    setRecipientEmail(userObj.email || '');
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchingRecipient(false);
    setRecipientError(null);
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWithdraw(true);
    setStatusMsg(null);

    const res = await apiFetch<any>('/withdrawals/request', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(withdrawAmount),
      }),
    });

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: res.data?.message || 'Withdrawal requested successfully! A 6-digit OTP has been sent to your phone.',
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
      setRecipientEmail('');
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

  const currentBal = Number(user?.wallet_balance || 0);

  return {
    user,
    currentBal,
    transactions,
    filteredTransactions,
    loading,
    auditFilter,
    setAuditFilter,
    statusMsg,
    setStatusMsg,

    // Modal toggles
    showWithdrawModal,
    setShowWithdrawModal,
    showTransferModal,
    setShowTransferModal,

    // Withdrawal
    withdrawAmount,
    setWithdrawAmount,
    submittingWithdraw,
    handleWithdrawalSubmit,

    // Transfer
    targetReferralCode,
    setTargetReferralCode,
    recipientName,
    recipientPhone,
    recipientEmail,
    transferAmount,
    setTransferAmount,
    transferNote,
    setTransferNote,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    searchingRecipient,
    verifiedRecipient,
    recipientError,
    submittingTransfer,
    dropdownRef,
    selectRecipient,
    handleTransferSubmit,
  };
}
