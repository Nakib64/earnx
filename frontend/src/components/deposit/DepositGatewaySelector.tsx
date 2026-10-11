'use client';

import React from 'react';
import { Wallet, Check, Copy } from 'lucide-react';
import { DepositGatewayConfig } from '../../types';
import { GlassCard } from '../design-system';

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
  instruction?: string;
}

export function DepositGatewaySelector({
  selectedMethod,
  setSelectedMethod,
  getMethodInfo,
  copiedKey,
  handleCopy,
  instruction,
}: DepositGatewaySelectorProps) {
  return (
    <GlassCard variant="standard" className="p-5 sm:p-6 space-y-4">
      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-emerald-700" />
        Official Deposit Gateways
      </h2>
      <p className="text-xs text-slate-500 font-semibold">
        Send funds to the verified gateway account numbers below:
      </p>

      <div className="space-y-3 pt-1">
        {(['BKASH', 'NAGAD', 'ROCKET'] as const).map((method) => {
          const info = getMethodInfo(method);
          const isSelected = selectedMethod === method;
          return (
            <div
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`cursor-pointer border rounded-2xl p-4 transition-all duration-200 specular-rim ${isSelected
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200/90 hover:border-slate-300 bg-white/70 hover:bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${info.badge}`}>
                    {info.name}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {info.type}
                  </span>
                </div>
                <span className="text-[11px] font-black text-slate-400">
                  {isSelected ? '✓ SELECTED' : 'TAP TO SELECT'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/90 rounded-xl px-3.5 py-2.5 border border-slate-200/80 mt-1 shadow-2xs">
                <span className=" font-black text-sm text-slate-900 tracking-wider tabular-nums">
                  {info.number}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(info.number, method);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${copiedKey === method
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                >
                  {copiedKey === method ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
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

      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-relaxed font-semibold">
        {instruction ? (
          <>
            📢 <strong>Notice:</strong> {instruction}
          </>
        ) : (
          <>
            ⚠️ <strong>Important:</strong> Only transfer from your personal bKash/Nagad/Rocket account. Keep your Transaction ID (TrxID) handy to submit below for automatic balance crediting.
          </>
        )}
      </div>
    </GlassCard>
  );
}
