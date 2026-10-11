'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  Mail,
  CreditCard,
  KeyRound,
  RefreshCw,
  X,
  ShieldCheck,
  LogIn,
  ArrowRight,
  Globe,
  Sparkles,
  Clock,
} from 'lucide-react';
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

  // Registration Mode: Choose Phone OR Email (Only One)
  const [authMode, setAuthMode] = useState<'PHONE' | 'EMAIL'>('PHONE');

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

  const currentIdentifier = authMode === 'PHONE' ? phone.trim() : email.trim();

  // Handle Initial Form Submit -> Send OTP to Phone or Email
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === 'PHONE' && !phone.trim()) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (authMode === 'EMAIL' && !email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

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
      body: JSON.stringify({
        target: currentIdentifier,
        phone: authMode === 'PHONE' ? phone.trim() : undefined,
        email: authMode === 'EMAIL' ? email.trim() : undefined,
      }),
    });

    if (res.success) {
      setShowOtpModal(true);
      setOtp('');
      setOtpError(null);
      setCooldownSeconds(120);
    } else {
      setError(
        res.error?.message ||
        `Failed to send verification code. Please check your ${authMode === 'PHONE' ? 'phone number' : 'email address'
        }.`,
      );
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
      body: JSON.stringify({
        target: currentIdentifier,
        phone: authMode === 'PHONE' ? phone.trim() : undefined,
        email: authMode === 'EMAIL' ? email.trim() : undefined,
      }),
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
      setOtpError('Please enter the 6-digit verification code sent to you.');
      return;
    }

    setVerifyingOtp(true);

    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: authMode === 'PHONE' ? phone.trim() : undefined,
        email: authMode === 'EMAIL' ? email.trim() : undefined,
        password,
        full_name: fullName.trim() || undefined,
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
    <div className="space-y-5">
      {/* ── SEGMENTED TAB SWITCHER (Glassmorphic + Neumorphic) ── */}
      <div className="bg-slate-200/60 backdrop-blur-xl p-1.5 rounded-[22px] flex items-center border border-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
        <Link
          href="/login"
          className="flex-1 py-2.5 px-4 rounded-[16px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-white/40"
        >
          <LogIn className="w-4 h-4 text-slate-400" />
          <span>Sign In</span>
        </Link>
        <button
          type="button"
          className="flex-1 py-2.5 px-4 rounded-[16px] text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all duration-300 bg-white text-emerald-950 shadow-[0_4px_14px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)]"
        >
          <UserPlus className="w-4 h-4 text-emerald-600" />
          <span>Register</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* ── MAIN REGISTRATION GLASS CARD ── */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/95 rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] specular-rim space-y-5">
        {/* Registration Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 ">
                Create Member Account
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">
                Instant active membership upon OTP verification
              </p>
            </div>
          </div>

        </div>

        {/* ── IDENTIFIER MODE TOGGLE: Phone OR Email (Neumorphic track) ── */}
        <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center space-x-1 border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('PHONE');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${authMode === 'PHONE'
              ? 'bg-emerald-700 text-white shadow-[0_4px_12px_rgba(4,120,87,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Use Phone Number</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('EMAIL');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${authMode === 'EMAIL'
              ? 'bg-emerald-700 text-white shadow-[0_4px_12px_rgba(4,120,87,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Use Email Address</span>
          </button>
        </div>

        <form onSubmit={handleInitiateRegister} className="space-y-4">
          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <User className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                required
                placeholder="Enter your official full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* 2. Phone Number (shown if authMode === 'PHONE') */}
          {authMode === 'PHONE' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Phone Number <span className="text-rose-500">*</span>
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
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                SMS verification OTP code will be dispatched to this number.
              </p>
            </div>
          )}

          {/* 3. Email Address (shown if authMode === 'EMAIL') */}
          {authMode === 'EMAIL' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Email verification OTP code will be sent to this email address.
              </p>
            </div>
          )}

          {/* 4. Country with Flag Indicator */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Country <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <span className="text-lg absolute left-3.5 top-3 shrink-0 pointer-events-none">
                {selectedCountryObj.flag}
              </span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200 cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Passport / National ID Number (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Passport / National ID Number
              </label>
              <span className="text-[10px] font-bold text-slate-400">Optional</span>
            </div>
            <div className="relative group">
              <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                placeholder="Optional ID or passport number..."
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* 6. Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Confirm <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#01281a] via-[#02432b] to-[#01281a] hover:from-[#013523] hover:to-[#013523] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(1,40,26,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_16px_34px_rgba(1,40,26,0.28)] transition-all active:scale-[0.985] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Preparing Security OTP...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Verify {authMode === 'PHONE' ? 'Phone' : 'Email'} &amp; Register</span>
                <ArrowRight className="w-4 h-4 text-emerald-300/80 ml-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-200/60 text-center">
          <p className="text-xs text-slate-500 font-semibold">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-black text-emerald-700 hover:text-emerald-900 hover:underline transition-colors ml-1"
            >
              Sign In Here &rarr;
            </Link>
          </p>
        </div>
      </div>

      {/* ── 6-DIGIT OTP VERIFICATION MODAL (Harmonized with EarnX Brand Palette) ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[26px] max-w-[440px] w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 specular-rim relative text-slate-800">
            {/* Top Bar with Eyebrow & Close Button */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-[0.24em]">
                <span className="w-5 h-[2px] bg-emerald-600 inline-block" />
                <span>VERIFICATION</span>
              </div>

              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-xs transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Title & Target Description */}
            <h2 className="text-[26px] sm:text-[30px] font-black text-slate-900 tracking-tight leading-tight mt-2.5 mb-2">
              Enter your code
            </h2>

            <div className="text-[13.5px] sm:text-[14px] text-slate-500 leading-normal font-semibold">
              <p>We sent a 6-digit security code to</p>
              <div className="flex items-center gap-2.5 mt-1">
                <strong className="text-base sm:text-[17px] font-black text-slate-900 underline underline-offset-4 decoration-emerald-500/60">
                  {currentIdentifier}
                </strong>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-sm font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-900 cursor-pointer transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Section Divider 1 */}
            <div className="w-full h-px bg-slate-100 my-5 sm:my-6" />

            {otpError && (
              <div className="mb-4 p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-rose-800 text-xs font-bold animate-in fade-in duration-150">
                <ShieldCheck className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed flex-1">{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister}>
              {/* Security Code Label + Counter */}
              <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3.5">
                <span>SECURITY CODE</span>
                <span className=" text-emerald-700 font-bold tracking-[0.16em]">
                  {otp.length} / 6
                </span>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="relative">
                {/* Invisible native input for autofill & keyboard interaction */}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                <div className="grid grid-cols-6 gap-2 sm:gap-2.5 pointer-events-none">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const char = otp[idx] || '';
                    const isCurrent = otp.length === idx;
                    return (
                      <div
                        key={idx}
                        className={`w-full aspect-[4/5] rounded-xl flex items-center justify-center transition-all duration-150 ${char
                            ? 'bg-white border-2 border-emerald-600 text-slate-900 text-2xl font-black shadow-xs'
                            : isCurrent
                              ? 'bg-white border-2 border-emerald-600 shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)]'
                              : 'bg-slate-50/80 border border-slate-200/90 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)]'
                          }`}
                      >
                        {char ? (
                          char
                        ) : isCurrent ? (
                          <span className="w-[2px] h-7 bg-emerald-600 animate-pulse rounded-full" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={verifyingOtp || otp.length !== 6}
                className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer mt-6 ${otp.length === 6 && !verifyingOtp
                    ? 'bg-gradient-to-r from-[#01281a] via-[#02432b] to-[#01281a] hover:from-[#013523] hover:to-[#013523] text-white shadow-[0_12px_28px_rgba(1,40,26,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_16px_34px_rgba(1,40,26,0.28)] active:scale-[0.99]'
                    : 'bg-slate-100 border border-slate-200/80 text-slate-400 cursor-not-allowed opacity-100'
                  }`}
              >
                {verifyingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>VERIFYING CODE...</span>
                  </>
                ) : (
                  <>
                    <span>COMPLETE REGISTRATION</span>
                    <span className="text-sm font-bold">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Section Divider 2 */}
            <div className="w-full h-px bg-slate-100 mt-6 mb-4 sm:mt-7 sm:mb-5" />

            {/* Footer: Timer & Resend */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                <span>
                  Resend in{' '}
                  <strong className="text-slate-900 font-black ">
                    {formatTimer(cooldownSeconds)}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                disabled={cooldownSeconds > 0 || resendingOtp}
                onClick={handleResendOtp}
                className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-900 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1"
              >
                {resendingOtp && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>RESEND CODE</span>
              </button>
            </div>

            {/* Never share note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mt-4 sm:mt-5">
              <Lock className="w-3 h-3 text-slate-400 stroke-[1.5]" />
              <span>Never share this code with anyone</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Atmospheric Refraction Orbs (Glassmorphism backdrop) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-sky-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md sm:max-w-lg relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-xs transition-transform group-hover:scale-105 specular-rim">
              <img
                src="/logo.png"
                alt="EarnX Capital"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 ">
              Create Member Account
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Join the EarnX Capital digital ecosystem &amp; start earning
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center bg-white/80 backdrop-blur-xl rounded-[28px] border border-white/90 shadow-sm text-xs font-bold text-slate-400">
              Loading registration portal...
            </div>
          }
        >
          <RegisterForm />
        </Suspense>

        {/* Security & Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Secured • End-to-End Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
