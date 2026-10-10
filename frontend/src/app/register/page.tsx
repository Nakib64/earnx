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
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* Registration Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Create Member Account</h2>
              <p className="text-[11px] text-slate-500 font-medium">Instant active membership upon verification</p>
            </div>
          </div>
        </div>

        {/* ── IDENTIFIER MODE TOGGLE: Phone OR Email (Only One) ── */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('PHONE');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${authMode === 'PHONE'
              ? 'bg-[#005A36] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
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
            className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${authMode === 'EMAIL'
              ? 'bg-[#005A36] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Use Email Address</span>
          </button>
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

          {/* 2. Phone Number (shown if authMode === 'PHONE') */}
          {authMode === 'PHONE' && (
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
              <p className="text-[10px] text-slate-500 font-medium">
                SMS verification OTP code will be dispatched to this number.
              </p>
            </div>
          )}

          {/* 3. Email Address (shown if authMode === 'EMAIL') */}
          {authMode === 'EMAIL' && (
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
              <p className="text-[10px] text-slate-500 font-medium">
                Email verification OTP code will be sent to this email address.
              </p>
            </div>
          )}

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

          {/* 5. Passport / National ID Number (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Passport / National ID Number
            </label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Optional ID or passport number..."
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 6. Password Fields */}
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
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{loading ? 'Sending Code...' : `Verify ${authMode === 'PHONE' ? 'Phone' : 'Email'} & Register`}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-black text-[#005A36] hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>

      {/* ── 6-DIGIT OTP VERIFICATION MODAL ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-[#005A36] flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Enter Verification Code
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Sent via {authMode === 'PHONE' ? 'SMS' : 'Email'} to {currentIdentifier}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center text-2xl  font-black tracking-widest py-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-[#005A36] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otp.length !== 6}
                className="w-full py-3 bg-[#005A36] hover:bg-[#044D2F] text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {verifyingOtp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{verifyingOtp ? 'Verifying Code...' : 'Complete Registration'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">
                {cooldownSeconds > 0 ? `Resend code in ${formatTimer(cooldownSeconds)}` : "Didn't receive code?"}
              </span>
              <button
                type="button"
                disabled={cooldownSeconds > 0 || resendingOtp}
                onClick={handleResendOtp}
                className="font-bold text-[#005A36] hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer flex items-center space-x-1"
              >
                {resendingOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Resend OTP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f8fbf9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl sm:text-3xl font-black text-[#005A36] tracking-tight">EarnX Capital</h1>
          </Link>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Digital Ecosystem & Capital Growth</p>
        </div>
        <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
