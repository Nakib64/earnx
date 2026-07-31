'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Search, Shield, Award, Edit, CheckCircle, XCircle, Slash, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Designation Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [targetDesignation, setTargetDesignation] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, desRes] = await Promise.all([
        apiFetch(`/admin/users?page=1&limit=50${search ? `&search=${search}` : ''}`, { isAdmin: true }),
        apiFetch('/admin/designations', { isAdmin: true }),
      ]);
      setUsers(usersRes.data || []);
      setDesignations(desRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) loadData();
  }, [admin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({ status: newStatus }),
      });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Status update failed');
    }
  };

  const handleAssignDesignation = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${selectedUser.id}/designation`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({ designation_id: targetDesignation || null }),
      });
      setSelectedUser(null);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Designation assignment failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Users Table */}
      <div className="glass-card rounded-2xl p-5 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading user database...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No users found</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-2">Member</th>
                <th className="pb-3 px-2">Referral Code</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Wallet Balance</th>
                <th className="pb-3 px-2">Designation Badge</th>
                <th className="pb-3 px-2">Sponsor</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-bold text-slate-900">{u.full_name || u.phone}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.phone}</div>
                  </td>

                  <td className="py-3 px-2 font-mono font-bold text-sky-600">{u.referral_code}</td>

                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'BLOCKED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-2 font-mono font-bold text-slate-800">
                    ${Number(u.wallet_balance).toFixed(2)}
                  </td>

                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                      <Award className="w-3 h-3 mr-1 text-purple-500" />
                      {u.designation?.name || 'None'}
                    </span>
                  </td>

                  <td className="py-3 px-2 text-slate-500 text-[11px]">
                    {u.referred_by?.phone || 'Direct Admin'}
                  </td>

                  <td className="py-3 px-2 text-right space-x-1">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setTargetDesignation(u.designation?.id || '');
                      }}
                      className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold text-[11px] hover:bg-purple-200"
                    >
                      Assign Badge
                    </button>

                    {u.status === 'DISABLED' && (
                      <button
                        onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px]"
                      >
                        Activate
                      </button>
                    )}

                    {u.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange(u.id, 'BLOCKED')}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded-lg font-bold text-[11px]"
                      >
                        Block
                      </button>
                    )}

                    {u.status === 'BLOCKED' && (
                      <button
                        onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                        className="px-2 py-1 bg-sky-100 text-sky-800 rounded-lg font-bold text-[11px]"
                      >
                        Unblock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
