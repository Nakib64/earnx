'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Offer } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminOffersPage() {
  const { admin } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    const res = await apiFetch<Offer[]>('/admin/offers', { isAdmin: true });
    if (res.success && res.data) {
      setOffers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchOffers();
  }, [admin]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await apiFetch('/admin/offers', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        title,
        description,
        reward_amount: parseFloat(rewardAmount),
      }),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Offer created successfully!' });
      setTitle('');
      setDescription('');
      setRewardAmount('');
      await fetchOffers();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to create offer' });
    }
    setSaving(false);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    const res = await apiFetch(`/admin/offers/${id}`, { method: 'DELETE', isAdmin: true });
    if (res.success) {
      fetchOffers();
    } else {
      alert(res.error?.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Offers & Tasks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Create special task promotions viewable strictly by ACTIVE members
        </p>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Create Offer Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Plus className="w-4 h-4 text-purple-600" />
          <span>Create New Offer</span>
        </h3>

        <form onSubmit={handleCreateOffer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Offer Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Follow EarnX Telegram Channel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reward Credit Amount (৳)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="100.00"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Instructions / Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detailed description of task steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="sky-gradient-btn py-2.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
          >
            <span>{saving ? 'Creating...' : 'Create Offer'}</span>
          </button>
        </form>
      </div>

      {/* Offers Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Existing Offers ({offers.length})</h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading offers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 bg-white border border-slate-200">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 font-mono text-base">
                      ৳{Number(offer.reward_amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{offer.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{offer.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
