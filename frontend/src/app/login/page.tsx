"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  X,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { AlertBanner } from '../../components/common/AlertBanner';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'PHONE' | 'OTP_RESET'>('PHONE');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessBanner(null);
    setLoading(true);

    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    if (res.success && res.data) {
      loginUser(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      setError(res.error?.message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  // 1. Send Forgot Password OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccessMsg(null);
    setForgotLoading(true);

    const res = await apiFetch<any>('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: forgotPhone.trim() }),
    });

    if (res.success) {
      setForgotStep('OTP_RESET');
      setCooldown(res.data?.cooldownSeconds || 120);
      setForgotSuccessMsg(
        `A 6-digit verification code has been sent via SMS to ${forgotPhone.trim()}.`,
      );
    } else {
      setForgotError(res.error?.message || 'Failed to send verification code. Please check your phone number.');
    }
    setForgotLoading(false);
  };

  // 2. Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    if (cooldown > 0 || forgotLoading) return;
    setForgotError(null);
    setForgotLoading(true);

    const res = await apiFetch<any>('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: forgotPhone.trim() }),
    });

    if (res.success) {
      setCooldown(res.data?.cooldownSeconds || 120);
      setForgotSuccessMsg(`New 6-digit verification code sent to ${forgotPhone.trim()}.`);
    } else {
      setForgotError(res.error?.message || 'Failed to resend code.');
    }
    setForgotLoading(false);
  };

  // 3. Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setForgotLoading(true);

    const res = await apiFetch<any>('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify({
        phone: forgotPhone.trim(),
        otp: forgotOtp.trim(),
        new_password: forgotNewPassword,
      }),
    });

    if (res.success) {
      setPhone(forgotPhone.trim());
      setShowForgotModal(false);
      setSuccessBanner('Your password has been reset successfully! Please sign in with your new password.');
      setPassword('');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    } else {
      setForgotError(res.error?.message || 'Password reset failed. Please check the OTP code.');
    }
    setForgotLoading(false);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4 sm:p-6 lg:p-8 min-h-[80vh] flex flex-col justify-center">

      {/* Header Card */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block">
          <img
            src="/logo.png"
            alt="EarnX Capital"
            className="h-14 w-auto object-contain mx-auto"
          />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Sign in to your member dashboard & wallet</p>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 text-xs font-bold text-emerald-900 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{successBanner}</p>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* Login Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <LogIn className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Member Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Phone Number
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep('PHONE');
                  setForgotPhone(phone || '');
                  setForgotOtp('');
                  setForgotNewPassword('');
                  setForgotConfirmPassword('');
                  setForgotError(null);
                  setForgotSuccessMsg(null);
                }}
                className="text-[11px] font-extrabold text-[#005A36] hover:text-[#044D2F] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
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
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
            <LogIn className="w-4 h-4 text-secondary" />
            <span>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </button>
        </form>
      </div>

      {/* Footer Links Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="text-center space-y-3">
          <p className="text-xs font-extrabold text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:text-[#044D2F] font-bold transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL (SMS OTP + RATE LIMITING) ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {forgotStep === 'PHONE' ? 'Reset Password' : 'Enter Verification Code'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500">
                  {forgotStep === 'PHONE'
                    ? 'Verify your phone number via SMS to reset password'
                    : `Enter the 6-digit OTP code sent to ${forgotPhone}`}
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {forgotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Success Notification */}
            {forgotSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {/* Step 1: Phone Input */}
            {forgotStep === 'PHONE' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Registered Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="01700000000"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    We will send a 6-digit OTP to your registered phone number.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotPhone.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification & New Password */}
            {forgotStep === 'OTP_RESET' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-Digit OTP Code */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      6-Digit OTP Code <span className="text-rose-500">*</span>
                    </label>
                    {cooldown > 0 ? (
                      <span className="text-[11px] font-mono font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Resend in {cooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendForgotOtp}
                        disabled={forgotLoading}
                        className="text-[11px] font-bold text-[#005A36] hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-extrabold text-slate-900 tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#005A36]"
                  />
                  <p className="text-[10px] text-slate-400 text-center font-medium">
                    Valid for 10 minutes. Maximum 5 verification attempts.
                  </p>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    New Password (Min. 6 chars) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('PHONE');
                      setForgotError(null);
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Change Phone
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6 || !forgotNewPassword}
                    className="px-5 py-2.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Reset Password & Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
