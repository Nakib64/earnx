'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, WalletTransaction, UserStatus } from '../../types';
import { apiFetch } from '../../lib/api';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Wallet, Award, DollarSign, Trash2, Shield, ArrowDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserDetailCardsProps {
  user: User | null;
  onAdjustBalance: (user: User) => void;
  onAssignBadge: (user: User) => void;
  onToggleStatus: (e: React.MouseEvent, user: User, newStatus: UserStatus) => void;
  onDeleteUser: (user: User) => void;
}

export function UserDetailCards({
  user,
  onAdjustBalance,
  onAssignBadge,
  onToggleStatus,
  onDeleteUser,
}: UserDetailCardsProps) {
  // Direct Downlines Data
  const [downlines, setDownlines] = useState<User[]>([]);
  const [loadingDownlines, setLoadingDownlines] = useState(false);

  // Transactions Data & Pagination
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotalRecords, setTxTotalRecords] = useState(0);

  const fetchTransactions = useCallback(async (pageToFetch = 1) => {
    if (!user) return;
    setLoadingTx(true);
    const resTx = await apiFetch<any>(
      `/admin/wallet/transactions?user_id=${user.id}&page=${pageToFetch}&limit=10`,
      { isAdmin: true },
    );
    if (resTx.success && resTx.data) {
      const dataArr = resTx.data.data || (Array.isArray(resTx.data) ? resTx.data : []);
      const meta = resTx.data.meta || {};
      setTransactions(dataArr);
      setTxPage(meta.page || pageToFetch);
      setTxTotalPages(meta.totalPages || 1);
      setTxTotalRecords(meta.total || dataArr.length);
    } else {
      setTransactions([]);
      setTxTotalPages(1);
      setTxTotalRecords(0);
    }
    setLoadingTx(false);
  }, [user]);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    // Fetch Direct Downlines
    setLoadingDownlines(true);
    const resDownlines = await apiFetch<any>(`/admin/users?referred_by_id=${user.id}&limit=100`, { isAdmin: true });
    if (resDownlines.success && resDownlines.data) {
      setDownlines(resDownlines.data.data || (Array.isArray(resDownlines.data) ? resDownlines.data : []));
    } else {
      setDownlines([]);
    }
    setLoadingDownlines(false);

    // Reset and Fetch Page 1 Transactions
    setTxPage(1);
    fetchTransactions(1);
  }, [user, fetchTransactions]);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  if (!user) return null;

  const transactionColumns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type_amount',
      header: 'Type & Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="flex items-center space-x-2">
            <StatusBadge status={tx.type} />
            <span className={`font-mono font-extrabold text-[11px] ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
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
        <span className="font-mono text-[10px] text-slate-500 font-semibold truncate block max-w-[140px]">
          ৳{Number(tx.balance_before).toFixed(2)} → ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description_date',
      header: 'Note & Date',
      align: 'right',
      render: (tx) => (
        <div className="text-right">
          <div className="text-slate-700 text-[10px] font-medium truncate max-w-[160px] sm:max-w-[220px] ml-auto">
            {tx.description || '-'}
          </div>
          <div className="text-slate-400 text-[9px] font-mono">{new Date(tx.created_at).toLocaleString()}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="glass-card rounded-none p-5 sm:p-6 space-y-6 bg-white border border-slate-200 shadow-xs mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-none bg-[#005A36] flex items-center justify-center text-[#D4AF37] font-extrabold text-base border-b-2 border-[#D4AF37]">
            {user.designation?.stars ? `${user.designation.stars}★` : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {user.full_name || 'Member Details'}
              </h2>
              <StatusBadge status={user.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Phone: <strong>{user.phone}</strong> · Ref: <strong>{user.referral_code}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchUserData}
          className="p-2 text-slate-500 hover:text-slate-700 rounded-none hover:bg-slate-100 transition-colors text-xs font-bold flex items-center space-x-1 self-start sm:self-auto border border-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Details</span>
        </button>
      </div>

      {/* Cards Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-2">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Designation & Star Badge</div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#005A36]" />
            <span className="text-sm font-extrabold text-[#005A36]">
              {user.designation?.name || 'Unbadged Member'}
            </span>
          </div>
          {user.designation && (
            <div className="text-[11px] text-slate-500 font-medium">
              Stars: {user.designation.stars}★ · Max Level Depth: {user.designation.max_level}
            </div>
          )}
        </div>

        {/* Sponsor & Downlines Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-2">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Hierarchy & Downlines</div>
          <div className="text-xs font-bold text-slate-700">
            Sponsor: {user.referred_by ? `${user.referred_by.phone} (${user.referred_by.full_name || 'Member'})` : 'Top of Tree'}
          </div>
          <div className="text-[11px] text-[#005A36] font-extrabold flex items-center space-x-1">
            <Users className="w-3.5 h-3.5" />
            <span>Direct Downlines: {downlines.length} Members</span>
          </div>
        </div>

        {/* Wallet Balance & Operations Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Wallet Balance</div>
            <div className="text-xl font-extrabold text-[#005A36] font-mono mt-0.5">
              ৳{Number(user.wallet_balance || 0).toFixed(2)}
            </div>
          </div>

          {/* Direct Operation Actions */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-slate-200">
            <button
              onClick={() => onAdjustBalance(user)}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-[#005A36] rounded-none font-extrabold text-[10px] flex items-center space-x-1 transition-colors border border-emerald-300"
            >
              <DollarSign className="w-3 h-3 text-[#005A36]" />
              <span>Adjust</span>
            </button>

            <button
              onClick={() => onAssignBadge(user)}
              className="px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-[#854D0E] rounded-none font-extrabold text-[10px] transition-colors border border-yellow-300"
            >
              Badge
            </button>

            {user.status === UserStatus.DISABLED && (
              <button
                onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
                className="px-2.5 py-1 bg-[#005A36] text-white hover:bg-[#044D2F] rounded-none font-extrabold text-[10px] transition-colors"
              >
                Activate
              </button>
            )}

            {user.status === UserStatus.ACTIVE && (
              <button
                onClick={(e) => onToggleStatus(e, user, UserStatus.BLOCKED)}
                className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-none font-extrabold text-[10px] transition-colors border border-rose-200"
              >
                Block
              </button>
            )}

            {user.status === UserStatus.BLOCKED && (
              <button
                onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
                className="px-2.5 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-none font-extrabold text-[10px] transition-colors border border-emerald-300"
              >
                Unblock
              </button>
            )}

            <button
              onClick={() => onDeleteUser(user)}
              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-none font-extrabold text-[10px] transition-colors border border-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-sky-600" />
            <span>Transaction History Log ({txTotalRecords})</span>
          </h3>
          {txTotalPages > 1 && (
            <span className="text-xs font-semibold text-slate-500">
              Page {txPage} of {txTotalPages}
            </span>
          )}
        </div>

        <DataTable<WalletTransaction>
          data={transactions}
          columns={transactionColumns}
          keyExtractor={(tx) => tx.id}
          loading={loadingTx}
          emptyMessage={`No transaction history recorded for ${user.full_name || user.phone} yet.`}
        />

        {/* Pagination Controls */}
        {txTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              onClick={() => {
                const newPage = Math.max(1, txPage - 1);
                fetchTransactions(newPage);
              }}
              disabled={txPage <= 1 || loadingTx}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center space-x-1 shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-slate-500 text-[11px] font-medium">
              Showing page <strong>{txPage}</strong> of <strong>{txTotalPages}</strong> ({txTotalRecords} total transactions)
            </span>

            <button
              onClick={() => {
                const newPage = Math.min(txTotalPages, txPage + 1);
                fetchTransactions(newPage);
              }}
              disabled={txPage >= txTotalPages || loadingTx}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center space-x-1 shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
