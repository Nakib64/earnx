'use client';

import React from 'react';
import { Clock, RefreshCw, Wallet } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { DepositRequest } from '../../types';
import { GlassCard, NumericAmount } from '../design-system';

interface DepositHistoryTableProps {
  deposits: DepositRequest[];
  loadingHistory: boolean;
  onRefresh: () => void;
}

export function DepositHistoryTable({
  deposits,
  loadingHistory,
  onRefresh,
}: DepositHistoryTableProps) {
  return (
    <GlassCard variant="standard" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs">
            <Clock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Your Deposit History</h3>
            <p className="text-xs font-semibold text-slate-500">Track all your submitted manual deposits and approvals</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingHistory ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : deposits.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">No deposit requests yet</p>
          <p className="text-xs text-slate-400 font-medium">When you submit a deposit, it will appear here for verification.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Sender Number</th>
                <th className="py-3 px-4">TrxID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {deposits.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                      {item.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4  font-bold text-slate-900 tabular-nums">
                    {item.sender_number}
                  </td>
                  <td className="py-3.5 px-4  text-[11px] text-slate-600 uppercase font-bold">
                    {item.trx_id}
                  </td>
                  <td className="py-3.5 px-4 font-black">
                    <NumericAmount value={Number(item.amount)} size="xs" semantic="gain" />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400  text-[11px] tabular-nums">
                    {new Date(item.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
