'use client';

import React from 'react';
import { Inbox, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CoinTransfer } from '../../types';

interface CoinIncomingTransfersProps {
  pendingTransfers: CoinTransfer[];
  loadingTransfers: boolean;
  approvingId: string | null;
  rejectingId: string | null;
  onRefresh: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function CoinIncomingTransfers({
  pendingTransfers,
  loadingTransfers,
  approvingId,
  rejectingId,
  onRefresh,
  onApprove,
  onReject,
}: CoinIncomingTransfersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Incoming Coin Transfer Requests</h3>
            <p className="text-xs font-semibold text-slate-500">
              Review and accept transfers sent to you by other members
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
      ) : pendingTransfers.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">No incoming transfer requests</p>
          <p className="text-xs text-slate-400">
            When someone transfers coins to your account, you can approve them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingTransfers.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">
                    Sender: {item.sender?.full_name || 'Member'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    {item.sender?.phone || item.sender?.email || item.sender?.referral_code}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                  Pending Your Action
                </span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Coins</span>
                  <p className="font-mono font-black text-slate-900 text-sm">
                    {Number(item.coin_amount)} SOL
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Agreed Rate</span>
                  <p className="font-mono font-black text-[#005A36] text-sm">
                    ৳{Number(item.coin_rate)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total BDT</span>
                  <p className="font-mono font-black text-slate-900 text-sm">
                    ৳{Number(item.total_bdt_value).toLocaleString()}
                  </p>
                </div>
              </div>

              {item.note && (
                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 italic">
                  &quot;{item.note}&quot;
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onApprove(item.id)}
                  disabled={approvingId === item.id}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {approvingId === item.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Accept Transfer</span>
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  disabled={rejectingId === item.id}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
