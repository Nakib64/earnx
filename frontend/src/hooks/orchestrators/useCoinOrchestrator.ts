'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { CoinInfo, CoinTransaction, CoinTransfer } from '../../types';
import { useAuth } from '../../context/AuthContext';

export type CoinTab = 'OVERVIEW' | 'TRANSFER' | 'INCOMING' | 'HISTORY';

export function useCoinOrchestrator() {
  const { user, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<CoinTab>('OVERVIEW');
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(10);
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '1M' | '1Y' | 'ALL'>('24H');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Coin Transfer states
  const [pendingTransfers, setPendingTransfers] = useState<CoinTransfer[]>([]);
  const [transferHistory, setTransferHistory] = useState<CoinTransfer[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferCoinAmount, setTransferCoinAmount] = useState('');
  const [transferCoinRate, setTransferCoinRate] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!coinInfo) {
      setLoading(true);
    }
    const [infoRes, txRes] = await Promise.all([
      apiFetch<CoinInfo>('/coins/info'),
      apiFetch<CoinTransaction[]>('/coins/transactions'),
    ]);

    if (infoRes.success && infoRes.data) {
      const data = (infoRes.data as any).data || infoRes.data;
      setCoinInfo(data);
      if (!transferCoinRate && data.coin_price) {
        setTransferCoinRate(String(data.coin_price));
      }
    }
    if (txRes.success && txRes.data) {
      const data = (txRes.data as any).data || txRes.data;
      setTransactions(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [transferCoinRate, coinInfo]);

  const fetchTransfers = useCallback(async () => {
    if (pendingTransfers.length === 0 && transferHistory.length === 0) {
      setLoadingTransfers(true);
    }
    const [pendingRes, historyRes] = await Promise.all([
      apiFetch<CoinTransfer[]>('/coins/transfers/pending'),
      apiFetch<CoinTransfer[]>('/coins/transfers/history'),
    ]);

    if (pendingRes.success && pendingRes.data) {
      setPendingTransfers(pendingRes.data);
    }
    if (historyRes.success && historyRes.data) {
      setTransferHistory(historyRes.data);
    }
    setLoadingTransfers(false);
  }, [pendingTransfers.length, transferHistory.length]);

  useEffect(() => {
    fetchData();
    fetchTransfers();
  }, [fetchData, fetchTransfers]);

  const handleBuyCoins = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!coinInfo) return;
    if (buyAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid coin amount greater than 0.' });
      return;
    }

    const totalCost = buyAmount * coinInfo.coin_price;
    if (coinInfo.wallet_balance < totalCost) {
      setMessage({
        type: 'error',
        text: `Insufficient wallet balance. Total cost is ৳${totalCost.toLocaleString()}, but you only have ৳${coinInfo.wallet_balance.toLocaleString()}.`,
      });
      return;
    }

    setPurchasing(true);
    setMessage(null);

    const res = await apiFetch<{ amount: number; cost: number; new_coin_balance: number }>(
      '/coins/buy',
      {
        method: 'POST',
        body: JSON.stringify({ amount: buyAmount }),
      },
    );

    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setMessage({
        type: 'success',
        text: `🎉 Successfully purchased ${data.amount} SOL coins for ৳${(data.cost || 0).toLocaleString()}!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to purchase coins.' });
    }
    setPurchasing(false);
  };

  const handleUnlockCoins = async () => {
    if (!coinInfo?.can_unlock) return;

    setUnlocking(true);
    setMessage(null);

    const res = await apiFetch<{ unlocked_amount: number; new_coin_balance: number }>(
      '/coins/unlock-premium',
      { method: 'POST' },
    );

    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setMessage({
        type: 'success',
        text: `🚀 Congratulations! ${data.unlocked_amount} locked SOL coins have been unlocked and added to your balance!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to unlock coins.' });
    }
    setUnlocking(false);
  };

  const handleCreateTransfer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage(null);

    const coinsNum = parseFloat(transferCoinAmount);
    const rateNum = parseFloat(transferCoinRate);

    if (!transferRecipient.trim()) {
      setMessage({ type: 'error', text: 'Please enter recipient referral code, phone, or email.' });
      return;
    }

    if (isNaN(coinsNum) || coinsNum <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid coin transfer amount.' });
      return;
    }

    if (isNaN(rateNum) || rateNum <= 0) {
      setMessage({ type: 'error', text: 'Please specify the coin exchange rate.' });
      return;
    }

    if (coinInfo && coinsNum > coinInfo.coin_balance) {
      setMessage({
        type: 'error',
        text: `Insufficient available coins. You only have ${coinInfo.coin_balance.toLocaleString()} SOL available.`,
      });
      return;
    }

    setTransferring(true);
    const res = await apiFetch<any>('/coins/transfer', {
      method: 'POST',
      body: JSON.stringify({
        receiver_code: transferRecipient.trim(),
        coin_amount: coinsNum,
        coin_rate: rateNum,
        note: transferNote.trim() || undefined,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Transfer initiated! ${coinsNum} coins are locked in escrow awaiting receiver confirmation.`,
      });
      setTransferCoinAmount('');
      setTransferRecipient('');
      setTransferNote('');
      fetchData();
      fetchTransfers();
      setActiveTab('HISTORY');
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to initiate coin transfer.' });
    }
    setTransferring(false);
  };

  const handleApproveTransfer = async (transferId: string) => {
    setApprovingId(transferId);
    setMessage(null);

    const res = await apiFetch<any>(`/coins/transfers/${transferId}/approve`, {
      method: 'POST',
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Coin transfer accepted! Coins credited to your balance.' });
      fetchData();
      fetchTransfers();
      refreshUserProfile();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to accept transfer.' });
    }
    setApprovingId(null);
  };

  const handleRejectTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to decline this transfer? Locked coins will be returned to the sender.')) {
      return;
    }

    setRejectingId(transferId);
    setMessage(null);

    const res = await apiFetch<any>(`/coins/transfers/${transferId}/reject`, {
      method: 'POST',
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Transfer declined and refunded to sender.' });
      fetchTransfers();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to reject transfer.' });
    }
    setRejectingId(null);
  };

  const copyReferralLink = () => {
    if (typeof window === 'undefined' || !user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const totalTransferBDT =
    parseFloat(transferCoinAmount) && parseFloat(transferCoinRate)
      ? (parseFloat(transferCoinAmount) * parseFloat(transferCoinRate)).toFixed(2)
      : '0.00';

  const buyCost = coinInfo ? buyAmount * coinInfo.coin_price : 0;
  const insufficientWallet = coinInfo ? coinInfo.wallet_balance < buyCost : false;

  return {
    state: {
      activeTab,
      coinInfo,
      transactions,
      loading,
      purchasing,
      unlocking,
      buyAmount,
      timeFilter,
      message,
      copiedLink,
      pendingTransfers,
      transferHistory,
      loadingTransfers,
      transferRecipient,
      transferCoinAmount,
      transferCoinRate,
      transferNote,
      transferring,
      approvingId,
      rejectingId,
    },
    computed: {
      user,
      totalTransferBDT,
      buyCost,
      insufficientWallet,
    },
    actions: {
      setActiveTab,
      setBuyAmount,
      setTimeFilter,
      setMessage,
      setCopiedLink,
      setTransferRecipient,
      setTransferCoinAmount,
      setTransferCoinRate,
      setTransferNote,
      fetchData,
      fetchTransfers,
      handleBuyCoins,
      handleUnlockCoins,
      handleCreateTransfer,
      handleApproveTransfer,
      handleRejectTransfer,
      copyReferralLink,
    },
  };
}
