'use client';

import React from 'react';
import { History, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { CoinTransfer } from '../../types';
import { GlassCard, NumericAmount } from '../design-system';

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
    <GlassCard variant="standard" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs">
            <History className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Coin Transfer History</h3>
            <p className="text-xs font-semibold text-slate-500">
              Complete  of sent and received Solana escrow transfers
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loadingTransfers ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingTransfers ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : transferHistory.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">No transfer history found</p>
          <p className="text-xs text-slate-400 font-medium">Your historical transactions will be recorded here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200/80">
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-black">
                          SENT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black">
                          RECEIVED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{partner?.full_name || 'Member'}</p>
                      <p className="text-[11px]  text-slate-400">
                        {partner?.phone || partner?.email || partner?.referral_code}
                      </p>
                    </td>
                    <td className="py-3.5 px-4  font-black text-slate-900 tabular-nums">
                      {Number(item.coin_amount)} SOL
                    </td>
                    <td className="py-3.5 px-4  font-bold text-emerald-700 tabular-nums">
                      ৳{Number(item.coin_rate)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      <NumericAmount value={Number(item.total_bdt_value)} size="xs" />
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
