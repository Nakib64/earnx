'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { ActivationRequest, PremiumRequest, WithdrawalRequest } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Check, Clock, DollarSign, Star } from 'lucide-react';

interface PendingQueueResponse {
  activations: ActivationRequest[];
  premiums: PremiumRequest[];
  withdrawals: WithdrawalRequest[];
}

export default function AdminApprovalsPage() {
  const { admin } = useAuth();
  const [activations, setActivations] = useState<ActivationRequest[]>([]);
  const [premiums, setPremiums] = useState<PremiumRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    const res = await apiFetch<PendingQueueResponse>('/admin/requests/pending', { isAdmin: true });
    if (res.success && res.data) {
      setActivations(res.data.activations || []);
      setPremiums(res.data.premiums || []);
      setWithdrawals(res.data.withdrawals || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchQueue();
  }, [admin]);

  const handleApproveActivation = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/requests/activation/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMsg({ type: 'success', text: 'Approved user activation and paid commissions!' });
      await fetchQueue();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Approval failed' });
    }
    setProcessingId(null);
  };

  const handleApprovePremium = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/requests/premium/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMsg({ type: 'success', text: 'Approved Premium upgrade! Weekly payouts active for 1 year.' });
      await fetchQueue();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Premium approval failed' });
    }
    setProcessingId(null);
  };

  const handleApproveWithdrawal = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/requests/withdrawal/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMsg({ type: 'success', text: 'Approved withdrawal! Deducted funds from user ledger balance.' });
      await fetchQueue();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Withdrawal approval failed' });
    }
    setProcessingId(null);
  };

  const handleRejectWithdrawal = async (id: string) => {
    setProcessingId(id);
    setMsg(null);
    const res = await apiFetch(`/admin/requests/withdrawal/${id}/reject`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMsg({ type: 'success', text: 'Rejected withdrawal request.' });
      await fetchQueue();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Rejection failed' });
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Central Approvals Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pending user activation, premium upgrade, and direct withdrawal requests
        </p>
      </div>

      {msg && <AlertBanner type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* WITHDRAWAL REQUESTS QUEUE */}
      <div className="glass-card rounded-2xl p-5 space-y-4 border-2 border-emerald-100 bg-white">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Pending Withdrawal Requests ({withdrawals.length})</span>
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading withdrawal queue...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No pending withdrawal requests</div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">
                      {w.user?.full_name || w.user?.phone}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-600">
                      ৳{Number(w.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    <strong>Payment Account:</strong> {w.payment_details}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    User Current Balance: ৳{Number(w.user?.wallet_balance || 0).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveWithdrawal(w.id)}
                    disabled={processingId === w.id}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Deduct</span>
                  </button>
                  <button
                    onClick={() => handleRejectWithdrawal(w.id)}
                    disabled={processingId === w.id}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PREMIUM REQUESTS QUEUE */}
      <div className="glass-card rounded-2xl p-5 space-y-4 border-2 border-amber-100 bg-white">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Pending Premium Upgrade Requests ({premiums.length})</span>
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading queue...</div>
        ) : premiums.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No pending premium requests</div>
        ) : (
          <div className="space-y-3">
            {premiums.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {p.user?.full_name || p.user?.phone}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Phone: {p.user?.phone} | Code: {p.user?.referral_code}
                  </div>
                </div>

                <button
                  onClick={() => handleApprovePremium(p.id)}
                  disabled={processingId === p.id}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Premium (1 Year Weekly Dividends)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVATION REQUESTS QUEUE */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-sky-500" />
          <span>Pending Activation Requests ({activations.length})</span>
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading queue...</div>
        ) : activations.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No pending activation requests</div>
        ) : (
          <div className="space-y-3">
            {activations.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {req.user?.full_name || req.user?.phone}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Phone: {req.user?.phone} | Code: {req.user?.referral_code}
                  </div>
                </div>

                <button
                  onClick={() => handleApproveActivation(req.id)}
                  disabled={processingId === req.id}
                  className="sky-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Admin Approve & Pay Commissions</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
