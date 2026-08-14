'use client';

import React, { useState } from 'react';
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
  Trophy,
  BarChart3,
  Lock,
  Headset,
  Coins,
  ChevronRight,
} from 'lucide-react';

export default function Homepage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '1M'>('24H');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 overflow-x-hidden">
      {/* 1. HERO SECTION (Full-Width Banner Background & Responsive Overlay) */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/7.5] min-h-[240px] sm:min-h-[380px] lg:min-h-[540px] bg-[#001710] overflow-hidden shadow-2xl">
        {/* Full-width 16:9 Hero Background Banner */}
        <img
          src="/hero-banner.jpg"
          alt="EarnX Capital Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
        />

        {/* Ambient Dark Gradient Overlay on Left Side for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001710]/95 via-[#001710]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001710]/80 via-transparent to-transparent pointer-events-none" />

        {/* Text & Action Overlay Container */}
        <div className="relative z-10 w-full h-full flex items-center">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6">
            <div className="max-w-[62%] sm:max-w-[58%] lg:max-w-xl space-y-2 sm:space-y-4 lg:space-y-6 text-left">
              <h1 className="text-sm xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.1]">
                Grow Your <br />
                Wealth With <br />
                <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                  EarnX
                </span>
              </h1>

              <p className="text-slate-200 text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-snug sm:leading-relaxed">
                Smart digital asset management with a premium experience.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 pt-0.5 sm:pt-2">
                <Link
                  href={user ? '/dashboard' : '/register'}
                  className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#03442e] hover:bg-[#04593d] text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl flex items-center space-x-1 sm:space-x-2 border border-[#056343] transition-all shadow-xl hover:scale-105"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </Link>

                <Link
                  href="/dashboard/coins"
                  className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#001710]/70 hover:bg-[#023322] text-slate-200 hover:text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl border border-slate-600/70 hover:border-[#d4af37]/60 transition-all backdrop-blur-sm"
                >
                  EarnX Coin
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 sm:pt-4 lg:pt-6 flex flex-wrap items-center gap-3 sm:gap-6 border-t border-[#053d29]/80">
                {/* Avatars Badge */}
                <div className="flex items-center space-x-1.5 sm:space-x-3">
                  <div className="flex -space-x-1.5 sm:-space-x-2.5">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                    ].map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt="User"
                        className="w-4 h-4 sm:w-7 sm:h-7 lg:w-9 lg:h-9 rounded-full border border-slate-900 object-cover shadow-sm"
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] sm:text-xs lg:text-base font-black text-white font-mono leading-none">25K+</div>
                    <div className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-slate-300">Active Users</div>
                  </div>
                </div>

                {/* Secure Platform Badge */}
                <div className="flex items-center space-x-1.5 sm:space-x-2.5">
                  <div className="w-4 h-4 sm:w-7 sm:h-7 lg:w-9 lg:h-9 rounded-full bg-[#023322] border border-[#d4af37]/40 flex items-center justify-center text-[#10b981]">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] sm:text-xs lg:text-base font-black text-white font-mono leading-none">100%</div>
                    <div className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-slate-300">Secure Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTIONS (White / Light Background Canvas) */}
      <div className="space-y-12 sm:space-y-16 pt-10 sm:pt-12">
        {/* 2. CRYPTO MARKET TICKER CARD (EARNX COIN - EXC) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Asset Info & Live Price */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center p-2 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs border border-amber-200 shadow-inner font-mono">
                    EX
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-white">EarnX Coin</h3>
                    <span className="text-xs font-bold text-slate-400 font-mono">(EXC)</span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                      $184.56
                    </span>
                    <span className="text-xs font-black text-[#10b981] font-mono bg-[#10b981]/15 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      +7.35% ↗ <span className="text-[10px] text-slate-400 font-medium">(24h)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SVG Live Green Stock Chart */}
              <div className="flex-1 max-w-md h-16 relative flex items-center">
                <svg className="w-full h-full text-[#10b981]" viewBox="0 0 300 60" fill="none">
                  <path
                    d="M0 45 L25 35 L50 40 L75 25 L100 30 L125 15 L150 20 L175 10 L200 25 L225 15 L250 20 L275 5 L300 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0 45 L25 35 L50 40 L75 25 L100 30 L125 15 L150 20 L175 10 L200 25 L225 15 L250 20 L275 5 L300 12 V 60 H 0 Z"
                    fill="url(#solGradient)"
                    opacity="0.2"
                  />
                  <defs>
                    <linearGradient id="solGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Market Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shrink-0 border-t lg:border-t-0 lg:border-l border-[#053d29] pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Market Cap</span>
                  <span className="font-mono font-black text-white">$83.45B</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">24h Volume</span>
                  <span className="font-mono font-black text-white">$3.21B</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Rank</span>
                  <span className="font-mono font-black text-amber-300">#5</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Circulating Supply</span>
                  <span className="font-mono font-black text-white">453.96M EXC</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 4 FEATURE CARDS SECTION (White Cards on Light Background) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Secure Account',
                desc: 'Advanced encryption and multi-layer security to protect your assets.',
              },
              {
                icon: BarChart3,
                title: 'Smart Dashboard',
                desc: 'Real-time analytics and insights to track your portfolio performance.',
              },
              {
                icon: Zap,
                title: 'Fast Transactions',
                desc: 'Experience lightning-fast deposits, withdrawals and transfers.',
              },
              {
                icon: Users,
                title: 'Team Management',
                desc: 'Powerful tools to build, manage and grow your winning team.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 hover:border-[#d4af37]/60 rounded-3xl p-6 text-center space-y-4 shadow-md hover:-translate-y-1 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#023824] border border-[#056343] group-hover:border-[#d4af37] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center mx-auto transition-all shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. SPLIT MIDDLE BANNER & TOP LEADERS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: Build Your Future Banner */}
            <div className="lg:col-span-7 bg-gradient-to-br from-[#023322] via-[#012418] to-[#011a12] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden space-y-6">
              <div className="space-y-3 relative z-10 max-w-md">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Build Your Future <br />
                  With <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">EarnX</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Invest in smart digital assets and grow your wealth with confidence.
                </p>
              </div>

              <div className="relative z-10 pt-2">
                <Link
                  href="/dashboard/investments"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105"
                >
                  <span>Explore Investment</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>
              </div>

              {/* Floating 3D Vault SVG / Visual */}
              <div className="absolute bottom-2 right-2 w-48 h-48 opacity-90 pointer-events-none hidden sm:block">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                  <rect x="40" y="40" width="120" height="120" rx="24" fill="#011f15" stroke="#d4af37" strokeWidth="4" />
                  <circle cx="100" cy="100" r="30" fill="#023322" stroke="#d4af37" strokeWidth="4" />
                  <circle cx="100" cy="100" r="14" fill="#f3ba2f" />
                  <path d="M100 80 V70 M100 120 V130 M80 100 H70 M120 100 H130" stroke="#d4af37" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Right Card: Top Leaders Preview (White Card) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 text-slate-950 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#f3ba2f]" />
                  <span>Top Leaders</span>
                </h3>
                <Link
                  href="/dashboard/leaderboard"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 transition-colors"
                >
                  <span>View Full Leaderboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Top 3 Leaders List */}
              <div className="space-y-3">
                {[
                  {
                    rank: 1,
                    name: 'Jahid Hasan',
                    role: 'Team Leader',
                    amount: '$125,680',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    badgeColor: 'bg-amber-400 text-slate-950',
                  },
                  {
                    rank: 2,
                    name: 'Meraz Hossain',
                    role: 'Senior Leader',
                    amount: '$98,540',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                    badgeColor: 'bg-slate-200 text-slate-800',
                  },
                  {
                    rank: 3,
                    name: 'Anutam Roy',
                    role: 'Team Leader',
                    amount: '$76,320',
                    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
                    badgeColor: 'bg-amber-700 text-amber-100',
                  },
                ].map((leader) => (
                  <div
                    key={leader.rank}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-[#d4af37]/40 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${leader.badgeColor}`}
                      >
                        {leader.rank}
                      </span>
                      <img
                        src={leader.avatar}
                        alt={leader.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{leader.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate">{leader.role}</p>
                      </div>
                    </div>

                    <span className="font-mono font-black text-sm text-slate-900 shrink-0 ml-2">
                      {leader.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS SECTION (Light Green / White Step Cards) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up in minutes and secure your account.',
              },
              {
                step: '02',
                title: 'Add Balance',
                desc: 'Deposit funds securely using multiple methods.',
              },
              {
                step: '03',
                title: 'Manage & Grow',
                desc: 'Invest, track and grow your wealth with Ease.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#f0f9f4] border border-[#cbe8d8] rounded-3xl p-6 text-left space-y-3 relative shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-[#10b981]">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#cbe8d8] flex items-center justify-center text-[#033e28] shadow-xs">
                    {idx === 0 ? <Coins className="w-5 h-5" /> : idx === 1 ? <Wallet className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                </div>
                <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CTA BANNER (Dark Green Card Banner on White Canvas) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4 max-w-xl">
              <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Ready to take control of your portfolio?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                  Join EarnX Capital today and start your journey towards financial freedom.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-2 shrink-0">
              <Link
                href={user ? '/dashboard' : '/register'}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>Create Your Account</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>

              <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> Secure Platform
                </span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <Headset className="w-3.5 h-3.5 text-[#f3ba2f]" /> 24/7 Support
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
