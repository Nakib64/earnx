'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Offer, UserStatus } from '../../../types';
import { Gift, Lock, DollarSign, CheckCircle2 } from 'lucide-react';

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const res = await apiFetch<Offer[]>('/offers');
      if (res.success && res.data) {
        setOffers(res.data);
      }
      setLoading(false);
    };

    if (user && user.status === UserStatus.ACTIVE) {
      fetchOffers();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.status !== UserStatus.ACTIVE) {
    return (
      <div className="glass-card rounded-none p-8 text-center space-y-4 max-w-lg mx-auto mt-10 bg-white border border-slate-200 shadow-xs">
        <div className="w-16 h-16 bg-yellow-50 text-[#854D0E] border border-yellow-300 rounded-none flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Offers & Tasks Locked</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your member account is currently in <strong>{user?.status || 'DISABLED'}</strong> status. Offers and promotional tasks are exclusively available to <strong>ACTIVE</strong> members.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center emerald-gold-btn px-6 py-2.5 rounded-none font-extrabold text-xs shadow-xs"
          >
            Go to Dashboard & Request Activation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Offers & Tasks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete promotions and tasks to earn instant bonus credits directly into your wallet
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">Loading active promotions...</div>
      ) : offers.length === 0 ? (
        <div className="glass-card rounded-none p-8 text-center space-y-2 bg-white border border-slate-200">
          <Gift className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-700">No active offers available right now</h3>
          <p className="text-xs text-slate-400">Check back soon for new task promotions from admins.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div key={offer.id} className="glass-card rounded-none p-5 flex flex-col justify-between space-y-4 bg-white border border-slate-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-yellow-50 text-[#854D0E] border border-yellow-300 rounded-none text-xs font-extrabold">
                    Special Offer
                  </span>
                  <div className="flex items-center space-x-1 text-[#005A36] font-extrabold text-base font-mono">
                    <DollarSign className="w-4 h-4" />
                    <span>{Number(offer.reward_amount).toFixed(2)}</span>
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">{offer.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3">{offer.description}</p>
              </div>

              <button className="w-full emerald-gold-btn py-2.5 rounded-none font-extrabold text-xs flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Complete Task & Claim</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
