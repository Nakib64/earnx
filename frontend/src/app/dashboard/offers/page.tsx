'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import { apiFetch } from '../../../lib/api';
import { Offer, UserStatus } from '../../../types';
import { Gift, Lock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../../components/design-system/GlassCard';
import { GlassButton } from '../../../components/design-system/GlassButton';
import { NumericAmount } from '../../../components/design-system/NumericAmount';
import { OffersSkeleton } from '../../../components/offers';

export default function OffersPage() {
  const { user } = useAuth();
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
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

  if (forceSkeletonLoading || loading) {
    return <OffersSkeleton />;
  }

  if (user?.status !== UserStatus.ACTIVE) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-4 animate-fade-in">
        <GlassCard className="p-8 text-center space-y-5 specular-rim" glow>
          <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/25 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Offers &amp; Tasks Locked</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your member account is currently in <strong className="text-slate-900">{user?.status || 'PENDING'}</strong> status. Exclusive promotional tasks are only unlocked for <strong className="text-emerald-700">ACTIVE</strong> members.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard">
              <GlassButton variant="primary" size="md" className="gap-2">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="p-6 sm:p-8 specular-rim" glow>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Special Rewards
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Active Offers &amp; Tasks</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-xl">
            Complete partner campaigns and promotional tasks to earn instant bonus credits directly into your wallet.
          </p>
        </div>
      </GlassCard>

      {offers.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3 specular-rim">
          <Gift className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No active promotions available right now</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Check back soon for new bounty campaigns and reward tasks from administrators.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {offers.map((offer) => (
            <GlassCard
              key={offer.id}
              className="p-6 flex flex-col justify-between space-y-5 specular-rim hover:-translate-y-1 transition-all duration-300"
              interactive
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Special Offer
                  </span>
                  <NumericAmount amount={Number(offer.reward_amount)} variant="gain" size="md" />
                </div>
                <h3 className="font-black text-slate-900 text-base tracking-tight">{offer.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{offer.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <GlassButton
                  variant="primary"
                  size="md"
                  className="w-full gap-2 shadow-md shadow-emerald-950/15"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Complete Task &amp; Claim</span>
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
