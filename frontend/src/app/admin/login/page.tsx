'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Phone, Lock, Eye, EyeOff, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
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
      body: JSON.stringify({ phone: phone.trim(), password }),
    });

    if (res.success && res.data) {
      loginAdmin(res.data.accessToken, res.data.admin);
      router.push('/admin/dashboard');
    } else {
      setError(res.error?.message || 'Invalid admin credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Soft Ambient Light Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-sky-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/95 shadow-xs transition-transform group-hover:scale-105 specular-rim">
              <img
                src="/logo.png"
                alt="EarnX Capital"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Sign in to manage EarnX Capital platform
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <AlertBanner type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Clean Glassmorphic Card */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/95 rounded-[26px] p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.07)] specular-rim space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#01281a] via-[#02432b] to-[#01281a] hover:from-[#013523] hover:to-[#013523] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(1,40,26,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_16px_34px_rgba(1,40,26,0.28)] transition-all active:scale-[0.985] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Discreet Client Portal Link */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
            >
              <span>Back to Client Login</span>
            </Link>
          </div>
        </div>

        {/* Minimal Bottom Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Admin Session</span>
        </div>
      </div>
    </div>
  );
}
