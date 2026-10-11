'use client';

import React from 'react';
import { ArrowDownCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { GlassCard, GlassButton } from '../design-system';

interface DepositSubmitFormProps {
  selectedMethod: 'BKASH' | 'NAGAD' | 'ROCKET';
  setSelectedMethod: (method: 'BKASH' | 'NAGAD' | 'ROCKET') => void;
  senderNumber: string;
  setSenderNumber: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  trxId: string;
  setTrxId: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function DepositSubmitForm({
  selectedMethod,
  setSelectedMethod,
  senderNumber,
  setSenderNumber,
  amount,
  setAmount,
  trxId,
  setTrxId,
  submitting,
  onSubmit,
}: DepositSubmitFormProps) {
  return (
    <GlassCard variant="standard" className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
          <ArrowDownCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 ">
            Submit Deposit Details
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Provide your payment transaction data for instant verification
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Select Gateway */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Selected Gateway <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['BKASH', 'NAGAD', 'ROCKET'] as const).map((method) => {
              const isSelected = selectedMethod === method;
              return (
                <button
                  type="button"
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`py-3 px-3 rounded-2xl border font-black text-xs transition-all text-center cursor-pointer ${isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-900/10'
                    : 'border-slate-200/90 bg-white/70 hover:bg-white text-slate-700'
                    }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sender Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Your Sender Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 01700000000"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Deposited Amount (৳ BDT) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="100"
            step="any"
            required
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-base font-black  text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-xs tabular-nums"
          />
          <p className="text-[11px] text-slate-500 font-semibold">Minimum deposit amount: ৳100 BDT</p>
        </div>

        {/* Transaction ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Transaction ID (TrxID) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 9J4K2L8M1N"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
            className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-sm  font-black uppercase text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-xs"
          />
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={submitting}
          icon={<CheckCircle2 className="w-4.5 h-4.5" />}
        >
          Submit Deposit
        </GlassButton>
      </form>
    </GlassCard>
  );
}
