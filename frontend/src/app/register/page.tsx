'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Phone, Lock, User, Share2, ArrowRight, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { AlertBanner } from '../../components/common/AlertBanner';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone,
        password,
        full_name: fullName || undefined,
        referral_code: referralCode ? referralCode.toUpperCase() : undefined,
      }),
    });

    if (res.success && res.data) {
      loginUser(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      setError(res.error?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* Registration Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Create Member Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Full Name <span className="normal-case text-slate-400 font-medium">(Optional)</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Phone Number <span className="text-red-400">*</span>
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
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 6 characters"
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
            {/* Password Strength */}
            <div className="flex items-center space-x-3 pt-1">
              <div className={`flex items-center space-x-1 text-[10px] font-extrabold ${password.length >= 6 ? 'text-primary' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>6+ chars</span>
              </div>
              <div className={`flex items-center space-x-1 text-[10px] font-extrabold ${/[A-Z]/.test(password) ? 'text-primary' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Uppercase</span>
              </div>
              <div className={`flex items-center space-x-1 text-[10px] font-extrabold ${/[0-9]/.test(password) ? 'text-primary' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Number</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Referral Code <span className="normal-case text-slate-400 font-medium">(Optional)</span>
            </label>
            <div className="relative">
              <Share2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="EX123456"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10 mt-1"
          >
            <UserPlus className="w-4 h-4 text-secondary" />
            <span>{loading ? 'Creating Account...' : 'Create Member Account'}</span>
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </button>
        </form>
      </div>

      {/* Footer Links Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <p className="text-xs font-extrabold text-slate-500 text-center">
          Already registered?{' '}
          <Link href="/login" className="text-primary hover:text-[#044D2F] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Join EarnX Platform</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Start earning multi-level commissions today</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 shadow-sm flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
