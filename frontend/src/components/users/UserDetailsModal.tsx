'use client';

import React, { useState, useEffect } from 'react';
import { User, WalletTransaction } from '../../types';
import { apiFetch } from '../../lib/api';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { X, Users, Wallet, Calendar, Shield, Award, ArrowUpRight } from 'lucide-react';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onExploreTree?: (user: User) => void;
}

export function UserDetailsModal({ user, isOpen, onClose, onExploreTree }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'downlines' | 'transactions'>('downlines');
  
  // Downlines Data
  const [downlines, setDownlines] = useState<User[]>([]);
  const [loadingDownlines, setLoadingDownlines] = useState(false);

  // Transactions Data
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch Direct Downlines
      const fetchDownlines = async () => {
        setLoadingDownlines(true);
        const res = await apiFetch<any>(`/admin/users?referred_by_id=${user.id}&limit=100`, { isAdmin: true });
        if (res.success && res.data) {
          setDownlines(res.data.data || (Array.isArray(res.data) ? res.data : []));
        } else {
          setDownlines([]);
        }
        setLoadingDownlines(false);
      };

      // Fetch Transaction History
      const fetchTransactions = async () => {
        setLoadingTx(true);
        const res = await apiFetch<any>(`/admin/wallet/transactions?user_id=${user.id}&limit=100`, { isAdmin: true });
        if (res.success && res.data) {
          setTransactions(res.data.data || (Array.isArray(res.data) ? res.data : []));
        } else {
          setTransactions([]);
        }
        setLoadingTx(false);
      };

      fetchDownlines();
      fetchTransactions();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const downlineColumns: ColumnDef<User>[] = [
    {
      key: 'phone',
      header: 'Member Phone',
      render: (u) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{u.phone}</div>
          <div className="text-[10px] text-slate-400">{u.full_name || 'No Name'}</div>
        </div>
      ),
    },
    {
      key: 'referral_code',
      header: 'Referral Code',
      render: (u) => <span className="font-mono text-xs text-slate-600">{u.referral_code}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'created_at',
      header: 'Joined Date',
      align: 'right',
      render: (u) => (
        <span className="text-slate-400 text-[10px]">
          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const transactionColumns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (tx) => <StatusBadge status={tx.type} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <span className={`font-mono font-bold text-xs ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Balance After',
      render: (tx) => (
        <span className="font-mono text-[11px] text-slate-500">
          ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Note',
      render: (tx) => <span className="text-slate-700 text-xs truncate max-w-xs">{tx.description || '-'}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      align: 'right',
      render: (tx) => <span className="text-slate-400 text-[10px]">{new Date(tx.created_at).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl sky-gradient-bg flex items-center justify-center text-white font-extrabold text-base shadow-md">
              {user.designation?.stars ? `${user.designation.stars}★` : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                {user.full_name || 'Member Details'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">Phone: {user.phone} · Ref: {user.referral_code}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Account Status</div>
            <div className="mt-1"><StatusBadge status={user.status} /></div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Wallet Balance</div>
            <div className="text-sm font-extrabold text-emerald-600 font-mono mt-1">
              ৳{Number(user.wallet_balance || 0).toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Designation</div>
            <div className="text-xs font-extrabold text-purple-700 mt-1 truncate">
              {user.designation?.name || 'Unbadged'}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Direct Referrals</div>
            <div className="text-sm font-extrabold text-sky-600 mt-1">
              {downlines.length} Members
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('downlines')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'downlines'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Downlines ({downlines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'transactions'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Transaction History ({transactions.length})</span>
          </button>

          {onExploreTree && (
            <button
              onClick={() => {
                onClose();
                onExploreTree(user);
              }}
              className="ml-auto text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <span>Explore Tree View</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'downlines' ? (
            <DataTable<User>
              data={downlines}
              columns={downlineColumns}
              keyExtractor={(u) => u.id}
              loading={loadingDownlines}
              emptyMessage={`No direct referral members registered under ${user.full_name || user.phone} yet.`}
            />
          ) : (
            <DataTable<WalletTransaction>
              data={transactions}
              columns={transactionColumns}
              keyExtractor={(tx) => tx.id}
              loading={loadingTx}
              emptyMessage={`No transaction history recorded for ${user.full_name || user.phone} yet.`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
