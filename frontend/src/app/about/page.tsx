'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Lock,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="bg-[#090d16] text-white min-h-screen space-y-16 pb-16 pt-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141a29] via-[#101522] to-[#0c0f1a] border border-[#d4af37]/40 text-white p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-[#d4af37]/40 px-4 py-1.5 rounded-full text-xs font-black tracking-wide text-amber-200">
            <Sparkles className="w-4 h-4 text-[#f3ba2f]" />
            <span>About EarnX Capital</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Building the Most Transparent <br />
            <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
              Digital Asset & Multi-Level Ecosystem
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-semibold max-w-2xl leading-relaxed">
            EarnX Capital is engineered from the ground up with ACID financial integrity, real-time downline processing, and instantaneous level commission distributions.
          </p>

          <div className="pt-2">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 text-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 text-sm"
              >
                <span>Join EarnX Today</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Why Members Trust EarnX
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold">
            Engineered with strict financial safeguards and maximum transparency for all members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111622] border border-slate-800 hover:border-[#d4af37]/60 rounded-3xl p-6 space-y-4 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">ACID Financial Ledger</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Every deposit, withdrawal, and level payout is processed inside isolated database transactions ensuring zero balance drift and total financial accuracy.
            </p>
          </div>

          <div className="bg-[#111622] border border-slate-800 hover:border-[#d4af37]/60 rounded-3xl p-6 space-y-4 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Star Designation Badges</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Earn status badges and unlock deeper tree level keys ranging from Level 1 up to Level 5 earning depths as your referral network expands.
            </p>
          </div>

          <div className="bg-[#111622] border border-slate-800 hover:border-[#d4af37]/60 rounded-3xl p-6 space-y-4 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Instant Automated Payouts</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Commission credits apply immediately upon team downline activations with full audit tracking in your account ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Network Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#141a29] via-[#101522] to-[#0c0f1a] border border-[#d4af37]/35 rounded-3xl p-8 text-white shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-black font-mono text-amber-200">25,000+</div>
            <div className="text-xs font-bold text-slate-300 mt-1">Active Community</div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-white">৳ 5.8M+</div>
            <div className="text-xs font-bold text-slate-300 mt-1">Total Distributed</div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-amber-300">5 Levels</div>
            <div className="text-xs font-bold text-slate-300 mt-1">Commission Depth</div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-white">99.99%</div>
            <div className="text-xs font-bold text-slate-300 mt-1">Uptime Reliability</div>
          </div>
        </div>
      </section>
    </div>
  );
}
