'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { User, Designation, UserStatus } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Search, Award, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Designation Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetDesignation, setTargetDesignation] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [usersRes, desRes] = await Promise.all([
      apiFetch<User[]>(`/admin/users?page=1&limit=50${search ? `&search=${search}` : ''}`, {
        isAdmin: true,
      }),
      apiFetch<Designation[]>('/admin/designations', { isAdmin: true }),
    ]);
    if (usersRes.success && usersRes.data) setUsers(usersRes.data);
    if (desRes.success && desRes.data) setDesignations(desRes.data);
    setLoading(false);
  };

  useEffect(() => {
    if (admin) loadData();
  }, [admin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    const res = await apiFetch(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      await loadData();
    } else {
      alert(res.error?.message || 'Status update failed');
    }
  };

  const handleAssignDesignation = async () => {
    if (!selectedUser) return;
    setSaving(true);
    const res = await apiFetch(`/admin/users/${selectedUser.id}/designation`, {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify({ designation_id: targetDesignation || null }),
    });
    if (res.success) {
      setSelectedUser(null);
      await loadData();
    } else {
      alert(res.error?.message || 'Designation assignment failed');
    }
    setSaving(false);
  };

  const userColumns: ColumnDef<User>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (u) => (
        <div>
          <div className="font-bold text-slate-900">{u.full_name || u.phone}</div>
          <div className="text-[11px] text-slate-500 font-mono">{u.phone}</div>
        </div>
      ),
    },
    {
      key: 'referral_code',
      header: 'Referral Code',
      render: (u) => <span className="font-mono font-bold text-sky-600">{u.referral_code}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'wallet_balance',
      header: 'Wallet Balance',
      render: (u) => <span className="font-mono font-bold text-slate-800">৳{Number(u.wallet_balance).toFixed(2)}</span>,
    },
    {
      key: 'designation',
      header: 'Designation Badge',
      render: (u) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
          <Award className="w-3 h-3 mr-1 text-purple-500" />
          {u.designation?.name || 'None'}
        </span>
      ),
    },
    {
      key: 'sponsor',
      header: 'Sponsor',
      render: (u) => <span className="text-slate-500 text-[11px]">{u.referred_by?.phone || 'Direct Admin'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => {
              setSelectedUser(u);
              setTargetDesignation(u.designation_id || '');
            }}
            className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold text-[11px] hover:bg-purple-200"
          >
            Assign Badge
          </button>

          {u.status === UserStatus.DISABLED && (
            <button
              onClick={() => handleStatusChange(u.id, UserStatus.ACTIVE)}
              className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px]"
            >
              Activate
            </button>
          )}

          {u.status === UserStatus.ACTIVE && (
            <button
              onClick={() => handleStatusChange(u.id, UserStatus.BLOCKED)}
              className="px-2 py-1 bg-red-100 text-red-800 rounded-lg font-bold text-[11px]"
            >
              Block
            </button>
          )}

          {u.status === UserStatus.BLOCKED && (
            <button
              onClick={() => handleStatusChange(u.id, UserStatus.ACTIVE)}
              className="px-2 py-1 bg-sky-100 text-sky-800 rounded-lg font-bold text-[11px]"
            >
              Unblock
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Accounts & Designations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search members, assign earning badges (depth keys), and toggle account statuses
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors self-start"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by phone, name, or referral code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <button type="submit" className="sky-gradient-btn px-5 py-2.5 rounded-xl font-bold text-xs">
          Search
        </button>
      </form>

      {/* Users Table using DataTable */}
      <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
        <DataTable<User>
          data={users}
          columns={userColumns}
          keyExtractor={(u) => u.id}
          loading={loading}
          emptyMessage="No matching users found."
        />
      </div>

      {/* Assign Designation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">
              Assign Earning Designation Badge
            </h3>
            <p className="text-xs text-slate-500">
              Assigning a designation badge unlocks earning commissions deeper into the downline tree for member <strong>{selectedUser.phone}</strong>.
            </p>

            <select
              value={targetDesignation}
              onChange={(e) => setTargetDesignation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold"
            >
              <option value="">No Designation (Level 1 Direct Only)</option>
              {designations.map((des) => (
                <option key={des.id} value={des.id}>
                  {des.name} (Unlocks up to Level {des.max_level} downlines)
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDesignation}
                disabled={saving}
                className="sky-gradient-btn px-5 py-2 rounded-xl text-xs font-bold"
              >
                {saving ? 'Saving...' : 'Save Designation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
