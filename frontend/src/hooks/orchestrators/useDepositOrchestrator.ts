'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { DepositRequest, DepositGatewayConfig } from '../../types';

export type DepositMethod = 'BKASH' | 'NAGAD' | 'ROCKET';

export function useDepositOrchestrator() {
  const [gateways, setGateways] = useState<DepositGatewayConfig | null>(null);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>('BKASH');
  const [senderNumber, setSenderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchGateways = useCallback(async () => {
    setLoadingGateways(true);
    const res = await apiFetch<DepositGatewayConfig>('/deposits/gateways');
    if (res.success && res.data) {
      setGateways(res.data);
    }
    setLoadingGateways(false);
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    const res = await apiFetch<any>('/deposits/my-history?page=1&limit=20');
    if (res.success && res.data) {
      setDeposits(res.data.data || []);
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    fetchGateways();
    fetchHistory();
  }, [fetchGateways, fetchHistory]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAlertMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid deposit amount.' });
      return;
    }

    if (!senderNumber.trim()) {
      setAlertMsg({ type: 'error', text: 'Please enter your sender mobile number.' });
      return;
    }

    if (!trxId.trim()) {
      setAlertMsg({ type: 'error', text: 'Please enter the transaction ID (TrxID).' });
      return;
    }

    setSubmitting(true);
    const res = await apiFetch('/deposits/submit', {
      method: 'POST',
      body: JSON.stringify({
        method: selectedMethod,
        sender_number: senderNumber.trim(),
        amount: numAmount,
        trx_id: trxId.trim().toUpperCase(),
      }),
    });

    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: 'Deposit request submitted successfully! Admin will verify and credit your wallet shortly.',
      });
      setAmount('');
      setTrxId('');
      fetchHistory();
    } else {
      setAlertMsg({
        type: 'error',
        text: res.error?.message || 'Failed to submit deposit request.',
      });
    }
    setSubmitting(false);
  };

  const getMethodInfo = (method: DepositMethod) => {
    if (!gateways) return { name: method, number: '...', type: '...', border: '', bg: '', text: '', badge: '' };
    switch (method) {
      case 'BKASH':
        return {
          name: 'bKash',
          number: gateways.bkash_number || '01XXXXXXXXX',
          type: gateways.bkash_type || 'Personal (Send Money)',
          border: 'border-pink-200',
          bg: 'bg-pink-50/50',
          text: 'text-pink-700',
          badge: 'bg-pink-600 text-white',
        };
      case 'NAGAD':
        return {
          name: 'Nagad',
          number: gateways.nagad_number || '01XXXXXXXXX',
          type: gateways.nagad_type || 'Personal (Send Money)',
          border: 'border-amber-200',
          bg: 'bg-amber-50/50',
          text: 'text-amber-700',
          badge: 'bg-amber-600 text-white',
        };
      case 'ROCKET':
        return {
          name: 'Rocket',
          number: gateways.rocket_number || '01XXXXXXXXX',
          type: gateways.rocket_type || 'Personal (Send Money)',
          border: 'border-purple-200',
          bg: 'bg-purple-50/50',
          text: 'text-purple-700',
          badge: 'bg-purple-600 text-white',
        };
    }
  };

  return {
    state: {
      gateways,
      deposits,
      loadingGateways,
      loadingHistory,
      submitting,
      selectedMethod,
      senderNumber,
      amount,
      trxId,
      copiedKey,
      alertMsg,
    },
    computed: {
      currentMethodInfo: getMethodInfo(selectedMethod),
    },
    actions: {
      setSelectedMethod,
      setSenderNumber,
      setAmount,
      setTrxId,
      setAlertMsg,
      handleCopy,
      handleSubmit,
      getMethodInfo,
      fetchGateways,
      fetchHistory,
    },
  };
}
