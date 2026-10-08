'use client';

import React from 'react';
import { History, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { CoinTransfer } from '../../types';

interface CoinHistoryTabProps {
  transferHistory: CoinTransfer[];
  loadingTransfers: boolean;
  currentUserId?: string;
  onRefresh: () => void;
}

export function CoinHistoryTab({
  transferHistory,
  loadingTransfers,
  currentUserId,
  onRefresh,
}: CoinHistoryTabProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <History className="w-5 h-5 text-[#005A36]" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Coin Transfer History</h3>
            <p className="text-xs font-semibold text-slate-500">
              All your sent and received Solana coin transfers
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loadingTransfers ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingTransfers ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 animate-spin text-[#005A36]" />
        </div>
      ) : transferHistory.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">No transfer history found</p>
          <p className="text-xs text-slate-400">Transfers will appear here once initiated.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4">Coins</th>
                <th className="py-3 px-4">Agreed Rate</th>
                <th className="py-3 px-4">Total BDT</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {transferHistory.map((item) => {
                const isSender = item.sender_id === currentUserId;
                const partner = isSender ? item.receiver : item.sender;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black">
                      {isSender ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-black">
                          SENT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black">
                          RECEIVED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{partner?.full_name || 'Member'}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {partner?.phone || partner?.email || partner?.referral_code}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      {Number(item.coin_amount)} SOL
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#005A36]">
                      ৳{Number(item.coin_rate)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ৳{Number(item.total_bdt_value).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
