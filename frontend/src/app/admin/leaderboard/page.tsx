'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { LeaderboardEntry } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Sparkles,
  Search,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import { useDebounce } from '../../../hooks/useDebounce';

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    rank: 1,
    name: '',
    phone: '',
    invested_amount: 100000,
    profit_earned: 15000,
    photo_url: '',
    badge: 'VIP Member',
  });

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const res = await apiFetch<LeaderboardEntry[]>('/leaderboard/admin/all', { isAdmin: true });
    if (res.success && res.data) {
      setEntries(res.data);
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    setMessage(null);
    const res = await apiFetch<{ message: string }>('/leaderboard/admin/seed', {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success && res.data) {
      setMessage({ type: 'success', text: res.data.message });
      fetchLeaderboard();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to seed leaderboard' });
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextRank = entries.length > 0 ? Math.max(...entries.map((e) => e.rank)) + 1 : 1;
    setFormData({
      rank: nextRank,
      name: '',
      phone: '',
      invested_amount: 100000,
      profit_earned: 15000,
      photo_url: '',
      badge: 'VIP Investor',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (entry: LeaderboardEntry) => {
    setEditingId(entry.id);
    setFormData({
      rank: entry.rank,
      name: entry.name,
      phone: entry.phone || '',
      invested_amount: Number(entry.invested_amount),
      profit_earned: Number(entry.profit_earned),
      photo_url: entry.photo_url || '',
      badge: entry.badge || '',
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const storedToken = localStorage.getItem('earnx_admin_token');
      const response = await fetch(`${API_BASE_URL}/leaderboard/admin/upload-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        body,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');

      setFormData((prev) => ({ ...prev, photo_url: data.url }));
    } catch (err: any) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = editingId
      ? await apiFetch(`/leaderboard/admin/${editingId}`, {
          method: 'PUT',
          isAdmin: true,
          body: JSON.stringify(formData),
        })
      : await apiFetch('/leaderboard/admin/create', {
          method: 'POST',
          isAdmin: true,
          body: JSON.stringify(formData),
        });

    if (res.success) {
      setMessage({
        type: 'success',
        text: editingId
          ? 'Leaderboard entry updated successfully!'
          : 'Leaderboard entry created successfully!',
      });
      setShowModal(false);
      fetchLeaderboard();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Action failed' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leaderboard entry?')) return;
    const res = await apiFetch(`/leaderboard/admin/${id}`, {
      method: 'DELETE',
      isAdmin: true,
    });
    if (res.success) {
      fetchLeaderboard();
    } else {
      alert(res.error?.message || 'Failed to delete entry');
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const leaderboardColumns: ColumnDef<LeaderboardEntry>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: (item) => <span className="font-bold text-slate-900">#{item.rank}</span>,
    },
    {
      key: 'name',
      header: 'Photo & Name',
      render: (item) => (
        <div className="flex items-center space-x-3">
          {item.photo_url ? (
            <img
              src={
                item.photo_url.startsWith('http')
                  ? item.photo_url
                  : `${API_BASE_URL.replace('/api', '')}${item.photo_url}`
              }
              alt={item.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
              {item.name[0]}
            </div>
          )}
          <span className="font-semibold text-slate-900">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => <span className="text-slate-500">{item.phone || 'N/A'}</span>,
    },
    {
      key: 'invested_amount',
      header: 'Invested Amount',
      render: (item) => <span className="font-bold text-sky-600">৳{Number(item.invested_amount).toLocaleString()}</span>,
    },
    {
      key: 'profit_earned',
      header: 'Profit Earned',
      render: (item) => <span className="font-bold text-emerald-600">৳{Number(item.profit_earned).toLocaleString()}</span>,
    },
    {
      key: 'badge',
      header: 'Badge',
      render: (item) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          {item.badge || 'Member'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          <button onClick={() => handleOpenEdit(item)} className="p-1 text-sky-600 hover:text-sky-800">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(item.id)} className="p-1 text-rose-500 hover:text-rose-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Top 100 Leaderboard Manager</span>
          </h1>
          <p className="text-xs text-slate-500">Upload user photos, adjust rankings, and manage leaderboards.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeed}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Seed Top 100 Mock Entries</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Entry</span>
          </button>
        </div>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Search & Entries Table using DataTable */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Leaderboard Records ({entries.length})</h2>
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <DataTable<LeaderboardEntry>
          data={filteredEntries}
          columns={leaderboardColumns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No leaderboard entries found."
        />
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Leaderboard Entry' : 'New Leaderboard Entry'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Rank Position (1 - 100)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label>Badge / Title</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label>Phone Number (Optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Invested Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.invested_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, invested_amount: Number(e.target.value) })
                    }
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label>Profit Earned (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.profit_earned}
                    onChange={(e) =>
                      setFormData({ ...formData, profit_earned: Number(e.target.value) })
                    }
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload Input */}
              <div className="space-y-1">
                <label>Photo Avatar</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="URL or Upload File"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="flex-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                  <label className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer text-slate-700 flex items-center space-x-1">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md"
              >
                {editingId ? 'Update Entry' : 'Create Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
