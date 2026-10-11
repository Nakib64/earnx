'use client';

import React from 'react';
import { UserInvestment, RequestStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Lock, Unlock, MinusCircle, Clock, TrendingUp } from 'lucide-react';
import { GlassCard, GlassButton, NumericAmount } from '../design-system';

interface InvestmentActiveBannerProps {
  activeInv: UserInvestment;
  onOpenWithdrawCapital: (inv: UserInvestment) => void;
}

export function InvestmentActiveBanner({
  activeInv,
  onOpenWithdrawCapital,
}: InvestmentActiveBannerProps) {
  const isLocked = Boolean(activeInv.ends_at && new Date() < new Date(activeInv.ends_at));

  return (
    <GlassCard
      variant="elevated"
      className="p-6 sm:p-7 text-slate-900 relative overflow-hidden space-y-4"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-emerald-800 shrink-0">
              Active Investment
            </span>
            <StatusBadge status={activeInv.status} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {activeInv.plan?.title || 'Investment Package'} —{' '}
            <NumericAmount value={Number(activeInv.amount)} size="xl" className=" text-slate-900" />
          </h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold truncate">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Monthly Return:</span>
            <strong className="text-emerald-700  font-black tabular-nums">
              +{Number(activeInv.monthly_return_percent)}%
            </strong>
            <span className="text-slate-400 ">
              (৳{Number(activeInv.monthly_payout_amount).toLocaleString()} / mo)
            </span>
          </div>

          {activeInv.ends_at && (
            <div className="flex items-center gap-2 pt-1">
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Locked until{' '}
                    {new Date(activeInv.ends_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Matured & Ready for Capital Withdrawal</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center">
          {activeInv.request_type === 'WITHDRAWAL' ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Withdrawal Request Pending Review</span>
            </span>
          ) : (
            <GlassButton
              onClick={() => onOpenWithdrawCapital(activeInv)}
              variant={isLocked ? 'secondary' : 'primary'}
              size="md"
              icon={isLocked ? <Lock className="w-4 h-4 text-amber-600" /> : <MinusCircle className="w-4 h-4" />}
            >
              {isLocked ? 'Capital Locked' : 'Withdraw Capital'}
            </GlassButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
