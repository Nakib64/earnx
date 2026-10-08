'use client';

import React from 'react';
import { Clock, RefreshCw, Wallet } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { DepositRequest } from '../../types';

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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Your Deposit History</h3>
            <p className="text-xs font-semibold text-slate-500">Track all your submitted deposit requests</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingHistory ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 animate-spin text-[#005A36]" />
        </div>
      ) : deposits.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">No deposit requests yet</p>
          <p className="text-xs text-slate-400">When you submit a deposit, it will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
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
                  <td className="py-3.5 px-4 font-black">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-800 font-black">
                      {item.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.sender_number}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#005A36]">
                    {item.trx_id}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ৳{Number(item.amount).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                    {item.rejection_reason && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">
                        Reason: {item.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(item.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
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
    </div>
  );
}
