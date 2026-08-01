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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl sky-gradient-bg text-white p-8 sm:p-12 md:p-16 shadow-2xl shadow-sky-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>About EarnX Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Building the Most Transparent <br />
            <span className="text-amber-300">Multi-Level Marketing Network</span>
          </h1>

          <p className="text-sky-100 text-base sm:text-lg leading-relaxed max-w-2xl">
            EarnX is designed from the ground up with ACID financial integrity, real-time downline depth processing, and instantaneous level commission distributions.
          </p>

          <div className="pt-2">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-white text-sky-600 hover:bg-sky-50 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all text-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 bg-white text-sky-600 hover:bg-sky-50 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all text-sm"
              >
                <span>Join EarnX Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Members Trust EarnX
          </h2>
          <p className="text-sm text-slate-500">
            Engineered with strict financial safeguards and maximum transparency for all members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-sky-300 transition-colors bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ACID Financial Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every deposit, withdrawal, and level payout is processed inside isolated database transactions ensuring zero balance drift and total financial accuracy.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-purple-300 transition-colors bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Star Designation Badges</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Earn status badges and unlock deeper tree level keys ranging from Level 1 up to Level 5 earning depths as your referral network expands.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-emerald-300 transition-colors bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Automated Payouts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Commissions are automatically calculated and distributed across the sponsor parent chain immediately when downline activations take place.
            </p>
          </div>
        </div>
      </section>

      {/* Network Stats Banner */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-sky-400">100%</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Uptime Guarantee</div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">5 Levels</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Deep Referral Keys</div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">Real-Time</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Commission Ledger</div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-purple-400">Top 100</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Global Leaderboard</div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center space-y-4 py-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Ready to Grow Your Financial Network?</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Create your account in less than a minute and start exploring downline earning opportunities.
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 sky-gradient-btn font-extrabold px-8 py-3.5 rounded-2xl shadow-lg text-xs"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
