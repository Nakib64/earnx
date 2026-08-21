'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Phone, Lock, User, Share2, Eye, EyeOff, UserPlus, CheckCircle2, Mail, Globe, CreditCard, KeyRound, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { AlertBanner } from '../../components/common/AlertBanner';

const COUNTRIES = [
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', flag: '🇦🇺' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(120);

  // Countdown timer for Resend OTP (2 minutes)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showOtpModal && cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpModal, cooldownSeconds]);

  // Handle Initial Form Submit -> Send OTP to Phone
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // Request 6-digit OTP from backend
    const res = await apiFetch<any>('/auth/send-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim() }),
    });

    if (res.success) {
      setShowOtpModal(true);
      setOtp('');
      setOtpError(null);
      setCooldownSeconds(120); // 2 minutes cooldown
    } else {
      setError(res.error?.message || 'Failed to send verification SMS. Please check your phone number.');
    }
    setLoading(false);
  };

  // Handle Resend OTP Request
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0) return;
    setResendingOtp(true);
    setOtpError(null);

    const res = await apiFetch<any>('/auth/send-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim() }),
    });

    if (res.success) {
      setCooldownSeconds(120);
      setOtp('');
    } else {
      setOtpError(res.error?.message || 'Failed to resend OTP. Please wait and try again.');
    }
    setResendingOtp(false);
  };

  // Handle Final Registration with OTP Verification
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    setVerifyingOtp(true);

    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: phone.trim(),
        password,
        full_name: fullName.trim() || undefined,
        email: email.trim() || undefined,
        country: country || 'Bangladesh',
        national_id: nationalId.trim() || undefined,
        otp: otp.trim(),
      }),
    });

    if (res.success && res.data) {
      loginUser(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      setOtpError(res.error?.message || 'Verification failed. Please check the code and try again.');
    }
    setVerifyingOtp(false);
  };

  const selectedCountryObj = COUNTRIES.find((c) => c.name === country) || COUNTRIES[0];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* Registration Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-sm">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Create Member Account</h2>
        </div>

        <form onSubmit={handleInitiateRegister} className="space-y-4">
          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Enter full name..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 2. Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="01700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 3. Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 4. Country with Flag Indicator */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="text-lg absolute left-3.5 top-2.5 shrink-0 pointer-events-none">
                {selectedCountryObj.flag}
              </span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Passport / National ID Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Passport / National ID Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Enter NID or Passport number..."
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm font-mono uppercase"
              />
            </div>
          </div>

          {/* 6. Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md mt-2"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>{loading ? 'Sending SMS OTP...' : 'Verify Phone & Create Account'}</span>
            {loading && (
              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            )}
          </button>
        </form>
      </div>

      {/* ── 6-DIGIT OTP VERIFICATION MODAL ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Verify Phone Number</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Enter the 6-digit SMS verification code sent to{' '}
                <strong className="text-slate-900 font-mono">{phone}</strong>
              </p>
            </div>

            {otpError && (
              <AlertBanner
                type="error"
                message={otpError}
                onClose={() => setOtpError(null)}
              />
            )}

            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-center text-xs font-black text-slate-700 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono font-black py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
                />
                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Valid for 10 minutes.
                </p>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={verifyingOtp || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-[#01281a] via-[#023c28] to-[#011f15] hover:from-[#023c28] disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{verifyingOtp ? 'Verifying Code...' : 'Verify & Complete Signup'}</span>
                {verifyingOtp && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </button>

              {/* Resend OTP button with 2-minute cooldown */}
              <div className="text-center pt-1">
                {cooldownSeconds > 0 ? (
                  <p className="text-xs text-slate-500 font-medium">
                    Resend code in <strong className="text-slate-800 font-mono">{formatTimer(cooldownSeconds)}</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    className="text-xs text-[#005A36] hover:text-[#013f26] font-extrabold underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${resendingOtp ? 'animate-spin' : ''}`} />
                    <span>{resendingOtp ? 'Resending...' : 'Resend SMS OTP'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Links Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm text-center">
        <p className="text-xs font-bold text-slate-600">
          Already registered?{' '}
          <Link href="/login" className="text-[#03442e] hover:text-[#04593d] font-black underline transition-colors">
            Sign In to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto p-4 sm:p-6 lg:p-8 min-h-[85vh] flex flex-col justify-center">
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
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Enterprise digital asset management & security</p>
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
