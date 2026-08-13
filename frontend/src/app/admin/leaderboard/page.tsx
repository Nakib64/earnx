'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { LeaderboardEntry } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Search,
  X,
  Award,
  GripVertical,
  ArrowUpDown,
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [savingReorder, setSavingReorder] = useState(false);

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
      // Ensure ordered by rank asc
      const sorted = [...res.data].sort((a, b) => a.rank - b.rank);
      setEntries(sorted);
    }
    setLoading(false);
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

  // Drag and Drop reordering logic
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder local array
    const updated = [...entries];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    // Re-assign ranks 1..N based on new array order
    const reordered = updated.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    setEntries(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save to backend
    setSavingReorder(true);
    const orders = reordered.map((item) => ({ id: item.id, rank: item.rank }));
    const res = await apiFetch('/leaderboard/admin/reorder', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ orders }),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Leaderboard ranking updated successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to save reordered ranks' });
      fetchLeaderboard(); // Revert on failure
    }
    setSavingReorder(false);
  };

  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Top 100 Leaderboard Manager
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Drag rows to adjust ranking, upload photos, and manage top earners.
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-700/50 text-secondary border border-emerald-500/30 font-mono shrink-0 hidden sm:inline-flex">
            {entries.length} Entries
          </span>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-emerald-700/60 pt-3 flex flex-wrap gap-2">
          <button
            onClick={handleOpenAdd}
            className="py-2 px-4 bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Entry</span>
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Leaderboard Rankings</span>
                {savingReorder && (
                  <span className="text-xs text-primary font-mono animate-pulse">Saving rank order...</span>
                )}
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                {isSearching ? 'Search filtering active (Drag to reorder disabled during search)' : 'Drag rows using the handle to adjust ranks'}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>
        </div>

        {/* Draggable Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-2 py-2 w-8 text-center"></th>
                <th className="px-2.5 py-2">Rank</th>
                <th className="px-2.5 py-2">Member</th>
                <th className="px-2.5 py-2 hidden sm:table-cell">Invested</th>
                <th className="px-2.5 py-2 hidden sm:table-cell">Profit</th>
                <th className="px-2.5 py-2 hidden sm:table-cell">Badge</th>
                <th className="px-2.5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Loading leaderboard entries...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No leaderboard entries found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item, index) => {
                  const isDragging = draggedIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <tr
                      key={item.id}
                      draggable={!isSearching}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      className={`transition-all ${
                        isDragging
                          ? 'opacity-40 bg-emerald-100/50'
                          : isOver
                          ? 'bg-emerald-50 border-y-2 border-primary'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Drag Handle */}
                      <td className="px-2 py-2 text-center text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 mx-auto" />
                      </td>

                      {/* Rank */}
                      <td className="px-2.5 py-2">
                        <span className="font-extrabold text-slate-900 font-mono text-xs">
                          #{item.rank}
                        </span>
                      </td>

                      {/* Member Photo & Name */}
                      <td className="px-2.5 py-2">
                        <div className="flex items-center space-x-2.5">
                          {item.photo_url ? (
                            <img
                              src={
                                item.photo_url.startsWith('http')
                                  ? item.photo_url
                                  : `${API_BASE_URL.replace('/api', '')}${item.photo_url}`
                              }
                              alt={item.name}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center font-extrabold text-primary text-xs shrink-0">
                              {item.name[0]}
                            </div>
                          )}
                          <div className="truncate max-w-[120px] sm:max-w-[180px]">
                            <p className="font-extrabold text-slate-900 text-xs truncate">{item.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono">{item.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Invested */}
                      <td className="px-2.5 py-2 hidden sm:table-cell">
                        <span className="font-extrabold text-primary font-mono text-xs">
                          ৳{Number(item.invested_amount).toLocaleString()}
                        </span>
                      </td>

                      {/* Profit */}
                      <td className="px-2.5 py-2 hidden sm:table-cell">
                        <span className="font-extrabold text-slate-900 font-mono text-xs">
                          ৳{Number(item.profit_earned).toLocaleString()}
                        </span>
                      </td>

                      {/* Badge */}
                      <td className="px-2.5 py-2 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-amber-50 text-[#854D0E] border border-amber-200 inline-block truncate max-w-[90px]">
                          {item.badge || 'Member'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-2.5 py-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Entry"
                            className="p-1.5 text-primary hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete Entry"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-xl border border-slate-200/90 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingId ? 'Edit Leaderboard Entry' : 'New Leaderboard Entry'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Rank Position (1 - 100)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Badge / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Investor"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Phone Number <span className="normal-case text-slate-400 font-medium">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="01700000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Invested (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.invested_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, invested_amount: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Profit (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.profit_earned}
                    onChange={(e) =>
                      setFormData({ ...formData, profit_earned: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  />
                </div>
              </div>

              {/* Photo Upload Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Photo Avatar</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="URL or Upload File"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  />
                  <label className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 cursor-pointer flex items-center space-x-1.5 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-primary" />
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

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
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
