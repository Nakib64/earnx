'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { ActivationRequest, PremiumRequest } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Check, X, Clock } from 'lucide-react';

interface DownlinesPendingResponse {
  activations: ActivationRequest[];
  premiums: PremiumRequest[];
}

export default function UserApprovalsPage() {
  const { user } = useAuth();
  const [activations, setActivations] = useState<ActivationRequest[]>([]);
  const [premiums, setPremiums] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const res = await apiFetch<DownlinesPendingResponse>('/requests/downlines/pending');
    if (res.success && res.data) {
      setActivations(res.data.activations || []);
      setPremiums(res.data.premiums || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchPending();
  }, [user]);

  const handleApproveActivation = async (id: string) => {
    setActionLoading(id);
    setMsg(null);
    const res = await apiFetch(`/requests/activation/${id}/approve`, { method: 'POST' });
    if (res.success) {
      setMsg({ type: 'success', text: 'Approved activation! Distributed level commissions to upline chain.' });
      await fetchPending();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Approval failed' });
    }
    setActionLoading(null);
  };

  const handleRejectActivation = async (id: string) => {
    setActionLoading(id);
    setMsg(null);
    const res = await apiFetch(`/requests/activation/${id}/reject`, { method: 'POST' });
    if (res.success) {
      setMsg({ type: 'success', text: 'Activation request rejected.' });
      await fetchPending();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Rejection failed' });
    }
    setActionLoading(null);
  };

  const handleApprovePremium = async (id: string) => {
    setActionLoading(id);
    setMsg(null);
    const res = await apiFetch(`/requests/premium/${id}/approve`, { method: 'POST' });
    if (res.success) {
      setMsg({ type: 'success', text: 'Approved premium request!' });
      await fetchPending();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Approval failed' });
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Downline Approvals Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          As a direct referrer, review and approve your downlines' activation and premium requests
        </p>
      </div>

      {msg && <AlertBanner type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Activation Requests */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pending Activation Requests ({activations.length})</span>
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading pending requests...</div>
        ) : activations.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No pending downline activation requests</div>
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
                  <div className="text-xs text-slate-500 font-mono">{req.user?.phone}</div>
                  <div className="text-[10px] text-slate-400">
                    Submitted: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveActivation(req.id)}
                    disabled={actionLoading === req.id}
                    className="sky-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectActivation(req.id)}
                    disabled={actionLoading === req.id}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Requests */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span>Pending Premium Requests ({premiums.length})</span>
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading pending requests...</div>
        ) : premiums.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No pending downline premium requests</div>
        ) : (
          <div className="space-y-3">
            {premiums.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {req.user?.full_name || req.user?.phone}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{req.user?.phone}</div>
                </div>

                <button
                  onClick={() => handleApprovePremium(req.id)}
                  disabled={actionLoading === req.id}
                  className="sky-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Premium</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
