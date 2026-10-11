'use client';

import React from 'react';
import { InvestmentPlan } from '../../types';
import { Lock, ShieldCheck, Wallet, ArrowRight, TrendingUp } from 'lucide-react';

interface InvestmentSubscribeModalProps {
  selectedPlan: InvestmentPlan;
  customInvestAmount: string;
  setCustomInvestAmount: (val: string) => void;
  selectedDuration: number;
  setSelectedDuration: (dur: number) => void;
  walletBal: number;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function InvestmentSubscribeModal({
  selectedPlan,
  customInvestAmount,
  setCustomInvestAmount,
  selectedDuration,
  setSelectedDuration,
  walletBal,
  submitting,
  onClose,
  onConfirm,
}: InvestmentSubscribeModalProps) {
  const minRequired = Number(selectedPlan.min_amount || selectedPlan.amount || 1000);
  const investAmt = parseFloat(customInvestAmount) || minRequired;

  const planDuration = selectedPlan.duration_months || selectedDuration || 3;
  const returnRate = Number(selectedPlan.monthly_return_percent || 10);
  const estimatedMonthlyDividend = (investAmt * returnRate) / 100;
  const estimatedTotalProfit = estimatedMonthlyDividend * planDuration;

  const unlockDate = new Date();
  unlockDate.setMonth(unlockDate.getMonth() + planDuration);
  const unlockDateStr = unlockDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isInsufficient = walletBal < investAmt;
  const isBelowMin = investAmt < minRequired;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-[family-name:var(--font-montserrat)]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {selectedPlan.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                {planDuration} Mo. Term
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              Fixed-Tenure Capital Investment Plan
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 ml-2 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Custom Invested Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Investment Amount (BDT)</span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Min. Required: <strong className="text-slate-900">৳{minRequired.toLocaleString()}</strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">৳</span>
              <input
                type="number"
                step="any"
                min={minRequired}
                value={customInvestAmount}
                onChange={(e) => setCustomInvestAmount(e.target.value)}
                placeholder={String(minRequired)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-slate-900 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
              />
            </div>
            {isBelowMin && (
              <p className="text-[11px] text-rose-500 font-semibold">
                Minimum investment amount is ৳{minRequired.toLocaleString()}
              </p>
            )}
          </div>

          {/* Tenure Information */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Package Tenure:</span>
              <span className="font-bold text-slate-900">{planDuration} Months Lock</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Monthly Interest Rate:</span>
              <span className="font-bold text-[#009F6B] tabular-nums">+{returnRate}% / month</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-slate-600 font-semibold">Monthly Return (To Wallet):</span>
              <span className="font-bold text-[#009F6B] text-sm tabular-nums">
                ৳{estimatedMonthlyDividend.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Total Profit over {planDuration} Mo:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                ৳{estimatedTotalProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Principal Unlock Date:</span>
              <span className="font-bold text-slate-900 tabular-nums">{unlockDateStr}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Your Current Wallet:</span>
              <span className={`font-bold tabular-nums ${isInsufficient ? 'text-rose-600' : 'text-slate-900'}`}>
                ৳{walletBal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Capital Lock Notice Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Capital Principal Lock Policy</span>
            </div>
            <p className="leading-relaxed">
              Before the {planDuration}-month package ends, the invested capital cannot be withdrawn. Monthly interest (৳{estimatedMonthlyDividend.toLocaleString()}) is added directly to your Cash Wallet every month.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || isInsufficient || isBelowMin}
            className="flex-1 py-3 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            {submitting ? (
              'Processing...'
            ) : isInsufficient ? (
              'Insufficient Balance'
            ) : isBelowMin ? (
              'Below Minimum'
            ) : (
              <>
                <span>Lock Investment</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
