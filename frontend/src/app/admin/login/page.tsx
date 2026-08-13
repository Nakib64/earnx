'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Phone, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await apiFetch<{ accessToken: string; admin: any }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    if (res.success && res.data) {
      loginAdmin(res.data.accessToken, res.data.admin);
      router.push('/admin/dashboard');
    } else {
      setError(res.error?.message || 'Admin authentication failed.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4 sm:p-6 lg:p-8 min-h-[80vh] flex flex-col justify-center">

      {/* Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block">
          <img
            src="/logo.png"
            alt="EarnX Capital"
            className="h-14 w-auto object-contain mx-auto"
          />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">EarnX System Administration & Management</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* Admin Banner */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-2">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-secondary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
              Restricted Access
            </h3>
            <p className="text-xs text-emerald-100/80 font-medium">
              This portal is for authorized system administrators only. All login attempts are logged.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Admin Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Admin Phone Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="01700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
          >
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>{loading ? 'Authenticating...' : 'Enter Admin Console'}</span>
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </button>
        </form>
      </div>

      {/* Back Link Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <Link
          href="/login"
          className="text-xs font-extrabold text-slate-400 hover:text-primary flex items-center justify-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Login</span>
        </Link>
      </div>
    </div>
  );
}
