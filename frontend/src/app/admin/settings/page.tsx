'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { SystemConfigMap } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [weeklyPayout, setWeeklyPayout] = useState('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await apiFetch<SystemConfigMap>('/admin/system-config', { isAdmin: true });
    if (res.success && res.data && res.data.PREMIUM_WEEKLY_PAYOUT_AMOUNT) {
      setWeeklyPayout(res.data.PREMIUM_WEEKLY_PAYOUT_AMOUNT);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const res = await apiFetch('/admin/system-config', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        key: 'PREMIUM_WEEKLY_PAYOUT_AMOUNT',
        value: weeklyPayout,
      }),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Premium Weekly Payout Amount updated successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to update settings' });
    }
    setSaving(false);
  };

  const handleTriggerPayouts = async () => {
    setTriggering(true);
    setMessage(null);
    const res = await apiFetch<{ processedCount: number; weeklyAmount: number }>(
      '/admin/premium/trigger-payouts',
      { method: 'POST', isAdmin: true },
    );

    if (res.success && res.data) {
      setMessage({
        type: 'success',
        text: `Processed weekly premium payout of ৳${res.data.weeklyAmount} for ${res.data.processedCount} users!`,
      });
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to trigger payouts' });
    }
    setTriggering(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-sky-600" />
            <span>Global System Configuration</span>
          </h1>
          <p className="text-xs text-slate-500">Configure global parameters and execution rules.</p>
        </div>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Premium Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Premium Package Weekly Payout Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Weekly Payout Amount Per Premium User (৳)
            </label>
            <p className="text-xs text-slate-500">
              Every active premium user will receive this exact amount every week for 1 year (52 weeks max).
            </p>
            <input
              type="number"
              value={weeklyPayout}
              onChange={(e) => setWeeklyPayout(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full py-3 px-6 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-sky-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Manual Trigger Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Run Weekly Payout Process Now</h3>
            <p className="text-xs text-slate-500">
              Runs the background scheduler immediately to disburse due weekly payouts to active premium users.
            </p>
          </div>
          <button
            onClick={handleTriggerPayouts}
            disabled={triggering}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Executing Payouts...' : 'Trigger Payouts Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
