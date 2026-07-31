'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Wallet,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const { user, admin } = useAuth();

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl sky-gradient-bg text-white p-8 sm:p-12 md:p-16 shadow-2xl shadow-sky-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Next-Gen Multi-Level Marketing Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
            Empower Your Network. <br />
            <span className="text-amber-300">Earn Without Limits.</span>
          </h1>

          <p className="text-sky-100 text-base sm:text-lg leading-relaxed max-w-2xl">
            EarnX combines high-integrity ACID transaction ledgers, dynamic referral depth calculations, and instant level commission distribution into a seamless web platform.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-white text-sky-600 hover:bg-sky-50 font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center space-x-2 group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : admin ? (
              <Link
                href="/admin/dashboard"
                className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Go to Admin Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-white text-sky-600 hover:bg-sky-50 font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center space-x-2 group"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="bg-sky-600/40 hover:bg-sky-600/60 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all"
                >
                  Member Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Financial Integrity & Transparency
          </h2>
          <p className="text-sm text-slate-500">
            Advanced features engineered for maximum security, speed, and real-time network visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Multi-Level Tree Traversal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamically calculates referral parent chains and pays level commissions instantly when downlines upgrade.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ACID Transaction Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every deposit, commission payout, and withdrawal is recorded in an immutable ledger with zero balance drift.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Designation Depth Keys</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unlock deeper level commissions by earning Star Badges assigned by team leaders and platform admins.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="glass-card rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Simple Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How EarnX Operates</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block w-8 h-8 rounded-full sky-gradient-bg text-white font-extrabold text-sm leading-8 text-center">
              1
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Register Account</h4>
            <p className="text-xs text-slate-500">Sign up with your phone number and sponsor referral code.</p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block w-8 h-8 rounded-full sky-gradient-bg text-white font-extrabold text-sm leading-8 text-center">
              2
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Get Activated</h4>
            <p className="text-xs text-slate-500">Request activation approved by your direct referrer or admin.</p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block w-8 h-8 rounded-full sky-gradient-bg text-white font-extrabold text-sm leading-8 text-center">
              3
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Build Your Tree</h4>
            <p className="text-xs text-slate-500">Share your referral link to build multi-level downlines.</p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block w-8 h-8 rounded-full sky-gradient-bg text-white font-extrabold text-sm leading-8 text-center">
              4
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Earn Commissions</h4>
            <p className="text-xs text-slate-500">Receive instant level commissions directly into your wallet.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to start earning?</h3>
          <p className="text-slate-400 text-xs sm:text-sm">Join thousands of active network marketers today.</p>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/register"
            className="sky-gradient-btn px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg"
          >
            Create Member Account
          </Link>
          <Link
            href="/login"
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
