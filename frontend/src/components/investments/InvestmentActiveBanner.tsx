'use client';

import React from 'react';
import { UserInvestment, RequestStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Lock, Unlock, MinusCircle, Clock } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="bg-white/10 border border-[#d4af37]/40 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-amber-200 shrink-0">
              Active Package
            </span>
            <StatusBadge status={activeInv.status} />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white truncate">
            {activeInv.plan?.title || 'Investment Package'} — ৳{Number(activeInv.amount).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
            Monthly Return:{' '}
            <strong className="text-[#f3ba2f] font-mono">
              {Number(activeInv.monthly_return_percent)}%
            </strong>{' '}
            (৳{Number(activeInv.monthly_payout_amount).toLocaleString()} / mo)
          </p>
          {activeInv.ends_at && (
            <div className="flex items-center gap-2 pt-1">
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-black">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Principal Locked until{' '}
                    {new Date(activeInv.ends_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Matured & Ready for Capital Withdrawal</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {activeInv.status === RequestStatus.APPROVED && (
            <button
              onClick={() => onOpenWithdrawCapital(activeInv)}
              disabled={isLocked}
              title={isLocked ? 'Capital is locked until tenure completes' : 'Withdraw your principal'}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4 shrink-0 text-slate-950" />
              <span className="truncate">{isLocked ? 'Capital Locked' : 'Withdraw Capital'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Alert Banners */}
      {activeInv.status === RequestStatus.PENDING && (
        <div className="bg-emerald-950/60 border border-emerald-600/40 rounded-xl p-4 flex items-start space-x-3 text-emerald-100 min-w-0">
          <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 min-w-0">
            <p className="font-extrabold text-secondary truncate">
              {activeInv.request_type === 'UPGRADE'
                ? `Package Upgrade Pending Admin Approval`
                : activeInv.request_type === 'WITHDRAWAL'
                ? `Capital Withdrawal Pending Admin Approval`
                : `New Investment Package Pending Admin Approval`}
            </p>
            <p className="text-emerald-100/90 leading-relaxed">
              {activeInv.request_type === 'UPGRADE'
                ? `Upgrading to ${activeInv.pending_plan?.title || 'Target Package'}. Remaining amount to pay: ৳${Number(activeInv.pending_amount || 0).toLocaleString()}.`
                : activeInv.request_type === 'WITHDRAWAL'
                ? `Requested capital withdrawal of ৳${Number(activeInv.pending_amount || 0).toLocaleString()} from your invested principal.`
                : `Your package subscription of ৳${Number(activeInv.amount).toLocaleString()} is awaiting verification by Admin.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
