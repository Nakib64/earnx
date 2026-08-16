'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Megaphone,
  ArrowLeft,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionNoticeId, setActionNoticeId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('Notice board');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/notices/admin', { isAdmin: true });
      let list: NoticeItem[] = [];
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        }
      } else if (Array.isArray(res)) {
        list = res as any;
      }
      setNotices(list);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load notices' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Notice content cannot be empty' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await apiFetch('/notices/admin', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({
          title: title.trim() || 'Notice board',
          content: content.trim(),
          is_active: isActive,
        }),
      });

      setMessage({ type: 'success', text: 'New notice posted successfully!' });
      setContent('');
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to post notice' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (notice: NoticeItem) => {
    setActionNoticeId(notice.id);
    setMessage(null);
    try {
      await apiFetch(`/notices/admin/${notice.id}`, {
        method: 'PUT',
        isAdmin: true,
        body: JSON.stringify({
          is_active: !notice.is_active,
        }),
      });
      setMessage({
        type: 'success',
        text: `Notice ${!notice.is_active ? 'activated' : 'deactivated'} successfully`,
      });
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update notice status' });
    } finally {
      setActionNoticeId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    setActionNoticeId(id);
    setMessage(null);
    try {
      await apiFetch(`/notices/admin/${id}`, {
        method: 'DELETE',
        isAdmin: true,
      });
      setMessage({ type: 'success', text: 'Notice deleted successfully' });
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete notice' });
    } finally {
      setActionNoticeId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Navigation / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/dashboard"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-6 h-6 text-primary" />
              <span>Notice Board Management</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Publish announcement notices displayed on the user dashboard notice board
            </p>
          </div>
        </div>

        <button
          onClick={fetchNotices}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Create New Notice Form */}
      <div className="bg-gradient-to-br from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#d4af37]/20 pb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-[#d4af37]/50 flex items-center justify-center text-[#f3ba2f]">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Post New Announcement</h2>
            <p className="text-xs text-amber-200/80">
              Only one notice is active at a time. Posting an active notice will update the user dashboard instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-black uppercase text-amber-300 tracking-wider">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notice board"
                className="w-full bg-[#023322] border border-[#d4af37]/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="text-xs font-black uppercase text-amber-300 tracking-wider mb-2">
                Status
              </label>
              <label className="flex items-center space-x-2 cursor-pointer bg-[#023322] border border-[#d4af37]/40 px-4 py-2.5 rounded-xl">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-amber-500 text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <span className="text-xs font-bold text-white">Set as Active Notice</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-amber-300 tracking-wider">
              Notice Description / Content *
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Welcome to EarnX Capital. Stay active, grow your network and achieve your financial freedom."
              className="w-full bg-[#023322] border border-[#d4af37]/40 rounded-xl p-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{submitting ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Notices List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <span>Notice History</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">Total: {notices.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No notices posted yet. Post your first notice above!
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  notice.is_active
                    ? 'bg-emerald-50/70 border-emerald-300/80 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{notice.title}</span>
                    {notice.is_active ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>ACTIVE DASHBOARD NOTICE</span>
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(notice.created_at).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(notice)}
                    disabled={actionNoticeId === notice.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-colors cursor-pointer ${
                      notice.is_active
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    <span>{notice.is_active ? 'Deactivate' : 'Set as Active'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(notice.id)}
                    disabled={actionNoticeId === notice.id}
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
