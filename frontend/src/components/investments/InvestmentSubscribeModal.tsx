'use client';

import React from 'react';
import { InvestmentPlan } from '../../types';
import { Lock } from 'lucide-react';

interface InvestmentSubscribeModalProps {
  selectedPlan: InvestmentPlan;
  customInvestAmount: string;
  setCustomInvestAmount: (val: string) => void;
  selectedDuration: 3 | 6 | 12;
  setSelectedDuration: (dur: 3 | 6 | 12) => void;
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
  const investAmt =
    parseFloat(customInvestAmount) || Number(selectedPlan.amount || selectedPlan.min_amount || 1000);
  const minRequired = Number(selectedPlan.min_amount || selectedPlan.amount || 500);

  const returnRate = selectedDuration === 3 ? 5 : selectedDuration === 6 ? 7.5 : 10;
  const estimatedDividend = (investAmt * returnRate) / 100;
  const unlockDate = new Date(
    Date.now() + selectedDuration * 30 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isInsufficient = walletBal < investAmt;
  const isBelowMin = investAmt < minRequired;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
              Subscribe to {selectedPlan.title}
            </h3>
            <p className="text-xs text-slate-500 font-semibold truncate">
              Fixed Package Subscription
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold shrink-0 ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Custom Invested Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Investment Amount (৳ BDT)</span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Min: ৳{minRequired.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-sm">৳</span>
              <input
                type="number"
                step="any"
                min={minRequired}
                value={customInvestAmount}
                onChange={(e) => setCustomInvestAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 text-sm focus:ring-2 focus:ring-[#005A36]"
              />
            </div>
          </div>

          {/* Flexible Tenure Duration Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Tenure & Duration Lock</label>
            <div className="grid grid-cols-3 gap-2">
              {([3, 6, 12] as const).map((dur) => {
                const isSelected = selectedDuration === dur;
                return (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setSelectedDuration(dur)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#005A36] bg-[#005A36] text-white shadow-sm font-black'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-xs">{dur} Months</div>
                    <div
                      className={`text-[10px] ${
                        isSelected ? 'text-emerald-200' : 'text-slate-500'
                      }`}
                    >
                      {dur === 3 ? '5%/mo' : dur === 6 ? '7.5%/mo' : '10%/mo'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breakdown Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Your Account Balance:</span>
              <span className="font-black text-primary font-mono">
                ৳{walletBal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Monthly Return Rate:</span>
              <span className="font-black text-[#01281a] font-mono">{returnRate}% / month</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span className="font-bold">Estimated Monthly Dividend:</span>
              <span className="font-black text-[#005A36] font-mono text-sm">
                ৳{estimatedDividend.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Principal Unlock Date:</span>
              <span className="font-black text-slate-900 font-mono">{unlockDate}</span>
            </div>
          </div>

          {/* Lock-In Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-medium text-amber-900 space-y-0.5">
            <span className="font-black text-amber-950 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Principal Capital Lock-In:
            </span>
            <p>
              Principal is locked until the {selectedDuration}-month tenure finishes. Monthly
              profits will be credited to your wallet balance on schedule.
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-300 font-black text-xs text-slate-700 hover:bg-slate-100 truncate cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting || isInsufficient || isBelowMin}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md disabled:opacity-50 truncate cursor-pointer"
          >
            {submitting
              ? 'Processing...'
              : isInsufficient
              ? 'Insufficient Balance'
              : 'Confirm & Lock Investment'}
          </button>
        </div>
      </div>
    </div>
  );
}
