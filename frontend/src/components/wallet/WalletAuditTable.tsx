'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { WalletTransaction } from '../../types';
import { GlassCard } from '../design-system';

interface WalletAuditTableProps {
  transactions: WalletTransaction[];
  loading: boolean;
  auditFilter: 'ALL' | 'BALANCE_TRANSFER' | 'WITHDRAW';
  onFilterChange: (filter: 'ALL' | 'BALANCE_TRANSFER' | 'WITHDRAW') => void;
}

export function WalletAuditTable({
  transactions,
  loading,
  auditFilter,
  onFilterChange,
}: WalletAuditTableProps) {
  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type_amount',
      header: 'Type & Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="flex items-center space-x-2 min-w-0">
            <StatusBadge status={tx.type} />
            <span
              className={` font-black text-xs truncate tabular-nums ${isCredit ? 'text-emerald-700' : 'text-rose-600'
                }`}
            >
              {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'balance',
      header: 'Before → After',
      render: (tx) => (
        <span className=" text-xs text-slate-500 font-semibold truncate block max-w-[130px] tabular-nums">
          ৳{Number(tx.balance_before).toFixed(2)} → ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description_date',
      header: 'Note & Date',
      align: 'right',
      render: (tx) => (
        <div className="text-right min-w-0">
          <div className="text-slate-800 text-xs font-semibold truncate max-w-[140px] sm:max-w-[240px] ml-auto">
            {tx.description || '-'}
          </div>
          <div className="text-slate-400 text-[10px]  truncate tabular-nums">
            {new Date(tx.created_at).toLocaleString()}
          </div>
        </div>
      ),
    },
  ];

  return (
    <GlassCard variant="standard" className="p-5 sm:p-7 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <h3 className="font-black text-slate-900 text-base tracking-tight truncate"> Audit History</h3>
        </div>

        {/* Audit History Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${auditFilter === 'ALL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            All Logs
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('BALANCE_TRANSFER')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${auditFilter === 'BALANCE_TRANSFER'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Direct Transfers
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('WITHDRAW')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${auditFilter === 'WITHDRAW'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      <DataTable<WalletTransaction>
        data={transactions}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        loading={loading}
      />
    </GlassCard>
  );
}
