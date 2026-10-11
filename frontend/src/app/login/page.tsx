'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  Phone,
  Mail,
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
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { AlertBanner } from '../../components/common/AlertBanner';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'IDENTIFIER' | 'OTP_RESET'>('IDENTIFIER');
  const [forgotTarget, setForgotTarget] = useState('');
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

  const isEmailInput = (val: string) => val.includes('@');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessBanner(null);
    setLoading(true);

    const clean = identifier.trim();
    const payload = isEmailInput(clean)
      ? { email: clean, identifier: clean, password }
      : { phone: clean, identifier: clean, password };

    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      loginUser(res.data.accessToken, res.data.user);
      router.push('/dashboard/premium');
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

    const cleanTarget = forgotTarget.trim();
    const res = await apiFetch<any>('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ target: cleanTarget }),
    });

    if (res.success) {
      setForgotStep('OTP_RESET');
      setCooldown(res.data?.cooldownSeconds || 120);
      const isMail = isEmailInput(cleanTarget);
      setForgotSuccessMsg(
        `A 6-digit verification code has been sent via ${isMail ? 'Email' : 'SMS'} to ${cleanTarget}.`,
      );
    } else {
      setForgotError(res.error?.message || 'Failed to send verification code. Please check your phone or email.');
    }
    setForgotLoading(false);
  };

  // 2. Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    if (cooldown > 0 || forgotLoading) return;
    setForgotError(null);
    setForgotLoading(true);

    const cleanTarget = forgotTarget.trim();
    const res = await apiFetch<any>('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ target: cleanTarget }),
    });

    if (res.success) {
      setCooldown(res.data?.cooldownSeconds || 120);
      const isMail = isEmailInput(cleanTarget);
      setForgotSuccessMsg(`New 6-digit verification code sent via ${isMail ? 'Email' : 'SMS'} to ${cleanTarget}.`);
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

    const cleanTarget = forgotTarget.trim();
    const res = await apiFetch<any>('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify({
        target: cleanTarget,
        otp: forgotOtp.trim(),
        new_password: forgotNewPassword,
      }),
    });

    if (res.success) {
      setIdentifier(cleanTarget);
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Atmospheric Refraction Orbs (Glassmorphism backdrop) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-sky-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
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
              Login Your Account
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Secure portal for daily tasks, rewards &amp; wallet management
            </p>
          </div>
        </div>

        {/* ── SEGMENTED TAB SWITCHER (Glassmorphic + Neumorphic) ── */}
        <div className="bg-slate-200/60 backdrop-blur-xl p-1.5 rounded-[22px] flex items-center border border-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            className="flex-1 py-2.5 px-4 rounded-[16px] text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all duration-300 bg-white text-emerald-950 shadow-[0_4px_14px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Sign In</span>
          </button>
          <Link
            href="/register"
            className="flex-1 py-2.5 px-4 rounded-[16px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-white/40"
          >
            <UserPlus className="w-4 h-4 text-slate-400" />
            <span>Register</span>
          </Link>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-3.5 bg-emerald-50/90 backdrop-blur-md border border-emerald-200/90 rounded-2xl flex items-start space-x-2.5 text-xs font-bold text-emerald-900 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p>{successBanner}</p>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <AlertBanner type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* ── MAIN LOGIN GLASS CARD ── */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/95 rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] specular-rim space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier (Phone or Email) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Phone Number or Email</span>
                <span className="text-[10px] font-bold text-emerald-700">Official Login</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  {isEmailInput(identifier) ? (
                    <Mail className="w-4.5 h-4.5" />
                  ) : (
                    <Phone className="w-4.5 h-4.5" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="01700000000 or user@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep('IDENTIFIER');
                    setForgotTarget(identifier || '');
                    setForgotOtp('');
                    setForgotNewPassword('');
                    setForgotConfirmPassword('');
                    setForgotError(null);
                    setForgotSuccessMsg(null);
                  }}
                  className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 flex items-center justify-center w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all duration-200"
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
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#01281a] via-[#02432b] to-[#01281a] hover:from-[#013523] hover:to-[#013523] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(1,40,26,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_16px_34px_rgba(1,40,26,0.28)] transition-all active:scale-[0.985] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-emerald-300" />
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300/80 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Switch Switcher Prompt */}
          <div className="pt-3 border-t border-slate-200/60 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              New to EarnX Capital?{' '}
              <Link
                href="/register"
                className="font-black text-emerald-700 hover:text-emerald-900 hover:underline transition-colors ml-1"
              >
                Create an Account &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span> SSL Secured • End-to-End Encrypted Session</span>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL (Harmonized with EarnX Brand Palette) ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[26px] max-w-[440px] w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 specular-rim relative text-slate-800">
            {/* Top Bar with Eyebrow & Close Button */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-[0.24em]">
                <span className="w-5 h-[2px] bg-emerald-600 inline-block" />
                <span>{forgotStep === 'IDENTIFIER' ? 'PASSWORD RECOVERY' : 'VERIFICATION'}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-xs transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Title & Target Description */}
            <h2 className="text-[26px] sm:text-[30px] font-black text-slate-900 tracking-tight leading-tight mt-2.5 mb-2">
              {forgotStep === 'IDENTIFIER' ? 'Reset password' : 'Enter your code'}
            </h2>

            {forgotStep === 'IDENTIFIER' ? (
              <p className="text-[13.5px] sm:text-[14px] text-slate-500 leading-normal font-semibold">
                Enter your registered phone or email to receive a 6-digit security code.
              </p>
            ) : (
              <div className="text-[13.5px] sm:text-[14px] text-slate-500 leading-normal font-semibold">
                <p>We sent a 6-digit security code to</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <strong className="text-base sm:text-[17px] font-black text-slate-900 underline underline-offset-4 decoration-emerald-500/60">
                    {forgotTarget}
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('IDENTIFIER');
                      setForgotError(null);
                    }}
                    className="text-sm font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-900 cursor-pointer transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Section Divider 1 */}
            <div className="w-full h-px bg-slate-100 my-5 sm:my-6" />

            {/* Error Notification */}
            {forgotError && (
              <div className="mb-4 p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-rose-800 text-xs font-bold animate-in fade-in duration-150">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed flex-1">{forgotError}</span>
              </div>
            )}

            {/* Success Notification */}
            {forgotSuccessMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 text-emerald-900 text-xs font-bold animate-in fade-in duration-150">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed flex-1">{forgotSuccessMsg}</span>
              </div>
            )}

            {/* Step 1: Identifier Input */}
            {forgotStep === 'IDENTIFIER' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-500">
                    PHONE NUMBER OR EMAIL
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                      {isEmailInput(forgotTarget) ? (
                        <Mail className="w-4.5 h-4.5" />
                      ) : (
                        <Phone className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="01700000000 or user@example.com"
                      value={forgotTarget}
                      onChange={(e) => setForgotTarget(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 font-bold text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotTarget.trim()}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#01281a] via-[#02432b] to-[#01281a] hover:from-[#013523] hover:to-[#013523] text-white font-black text-xs tracking-[0.18em] uppercase shadow-[0_12px_28px_rgba(1,40,26,0.22)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>SENDING CODE...</span>
                      </>
                    ) : (
                      <>
                        <span>SEND SECURITY CODE</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification & New Password */}
            {forgotStep === 'OTP_RESET' && (
              <form onSubmit={handleResetPassword}>
                {/* Security Code Label + Counter */}
                <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3.5">
                  <span>SECURITY CODE</span>
                  <span className=" text-emerald-700 font-bold tracking-[0.16em]">
                    {forgotOtp.length} / 6
                  </span>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />

                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5 pointer-events-none">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const char = forgotOtp[idx] || '';
                      const isCurrent = forgotOtp.length === idx;
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

                {/* New Password Fields */}
                <div className="space-y-3 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-500">
                      NEW PASSWORD
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-500">
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-700 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/75 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={forgotLoading || forgotOtp.length !== 6 || !forgotNewPassword}
                  className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer mt-6 ${forgotOtp.length === 6 && forgotNewPassword && !forgotLoading
                      ? 'bg-gradient-to-r from-[#01281a] via-[#02432b] to-[#01281a] hover:from-[#013523] hover:to-[#013523] text-white shadow-[0_12px_28px_rgba(1,40,26,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_16px_34px_rgba(1,40,26,0.28)] active:scale-[0.99]'
                      : 'bg-slate-100 border border-slate-200/80 text-slate-400 font-black tracking-[0.18em] cursor-not-allowed opacity-100'
                    }`}
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>RESETTING PASSWORD...</span>
                    </>
                  ) : (
                    <>
                      <span>RESET PASSWORD &amp; SIGN IN</span>
                      <span className="text-sm font-bold">→</span>
                    </>
                  )}
                </button>

                {/* Section Divider 2 */}
                <div className="w-full h-px bg-slate-100 mt-6 mb-4 sm:mt-7 sm:mb-5" />

                {/* Footer: Timer & Resend */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                    <span>
                      Resend in{' '}
                      <strong className="text-slate-900 font-black ">
                        {formatTimer(cooldown)}
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={cooldown > 0 || forgotLoading}
                    onClick={handleResendForgotOtp}
                    className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-900 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    RESEND CODE
                  </button>
                </div>

                {/* Never share note */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mt-4 sm:mt-5">
                  <Lock className="w-3 h-3 text-slate-400 stroke-[1.5]" />
                  <span>Never share this code with anyone</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
