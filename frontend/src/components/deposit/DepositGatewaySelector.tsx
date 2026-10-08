'use client';

import React from 'react';
import { Wallet, Check, Copy } from 'lucide-react';
import { DepositGatewayConfig } from '../../types';

interface DepositGatewaySelectorProps {
  selectedMethod: 'BKASH' | 'NAGAD' | 'ROCKET';
  setSelectedMethod: (method: 'BKASH' | 'NAGAD' | 'ROCKET') => void;
  getMethodInfo: (method: 'BKASH' | 'NAGAD' | 'ROCKET') => {
    name: string;
    number: string;
    type: string;
    badge: string;
  };
  copiedKey: string | null;
  handleCopy: (text: string, key: string) => void;
}

export function DepositGatewaySelector({
  selectedMethod,
  setSelectedMethod,
  getMethodInfo,
  copiedKey,
  handleCopy,
}: DepositGatewaySelectorProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#005A36]" />
        Official Deposit Numbers
      </h2>
      <p className="text-xs text-slate-500 font-medium">
        Send money to the numbers below according to your preferred payment gateway:
      </p>

      <div className="space-y-3 pt-1">
        {(['BKASH', 'NAGAD', 'ROCKET'] as const).map((method) => {
          const info = getMethodInfo(method);
          const isSelected = selectedMethod === method;
          return (
            <div
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`cursor-pointer border rounded-2xl p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-[#005A36] bg-emerald-50/40 shadow-sm ring-1 ring-[#005A36]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase ${info.badge}`}>
                    {info.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {info.type}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {isSelected ? '✓ Selected' : 'Tap to select'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl px-3.5 py-2">
                <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                  {info.number}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(info.number, method);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#005A36] hover:text-[#044D2F] px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 transition-colors"
                >
                  {copiedKey === method ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs text-amber-900">
        <p className="font-black text-amber-950 flex items-center gap-1.5">
          📌 Important Deposit Instructions:
        </p>
        <ul className="list-disc list-inside space-y-1 font-medium text-[11px] leading-relaxed">
          <li>Always &quot;Send Money&quot; (Personal) to the specified account.</li>
          <li>Save the Transaction ID (TrxID) received via SMS.</li>
          <li>Submit the form with your Sender Number and TrxID for verification.</li>
          <li>Approvals usually take 5–15 minutes after submission.</li>
        </ul>
      </div>
    </div>
  );
}
