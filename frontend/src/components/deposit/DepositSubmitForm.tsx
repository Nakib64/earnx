'use client';

import React from 'react';
import { ArrowDownCircle, RefreshCw, Send } from 'lucide-react';

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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#005A36] shrink-0">
          <ArrowDownCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Submit Deposit Information</h2>
          <p className="text-xs font-semibold text-slate-500">Provide payment details for instant verification</p>
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
                  className={`py-3 px-3 rounded-xl border font-black text-xs transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'border-[#005A36] bg-[#005A36] text-white shadow-md shadow-emerald-950/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
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
            Your Sender Mobile Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 01712345678"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-sm"
          />
          <p className="text-[11px] text-slate-400 font-medium">The mobile number from which you sent the money.</p>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Deposit Amount (৳ BDT) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-400 font-black text-sm">৳</span>
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-base"
            />
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            {[100, 300, 500, 1000, 2000, 5000].map((quickAmt) => (
              <button
                key={quickAmt}
                type="button"
                onClick={() => setAmount(String(quickAmt))}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                ৳{quickAmt}
              </button>
            ))}
          </div>
        </div>

        {/* TrxID */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Transaction ID (TrxID) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. BL92KJ78Z"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#005A36] text-base"
          />
          <p className="text-[11px] text-slate-400 font-medium">Enter the exact TrxID from your SMS or payment receipt.</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !senderNumber || !amount || !trxId}
          className="w-full py-4 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/20 cursor-pointer"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-emerald-300" />
              <span>Submit Deposit Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
