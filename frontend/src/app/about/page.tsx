'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  ShieldCheck,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Award,
  Zap,
} from 'lucide-react';
import Footer from '../../components/Footer';

const corePillars = [
  {
    title: 'Marketplace Commerce',
    desc: 'Connecting verified merchants, physical goods, digital assets, and high-demand services directly with global consumers.',
    icon: ShoppingBag,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
  },
  {
    title: 'Sales & Affiliate Marketing',
    desc: 'Performance-driven marketing system giving independent partners verified products to promote and earn instant commissions.',
    icon: TrendingUp,
    color: 'amber',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-800',
    watermarkColor: 'text-amber-900/[0.04]',
  },
  {
    title: 'Team-Based Business',
    desc: 'Collaborative leadership network empowering individuals to build, mentor, and earn tiered incentives and overrides.',
    icon: Users,
    color: 'blue',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-800',
    watermarkColor: 'text-blue-900/[0.04]',
  },
  {
    title: 'Structured Investment',
    desc: 'Institutional-grade capital allocation governed by strict due diligence, bilateral legal agreements, and scheduled returns.',
    icon: ShieldCheck,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
  },
  {
    title: 'Agency & Digital Solutions',
    desc: 'Professional digital marketing, branding, web development, SEO, and social management to help brands reach massive audiences.',
    icon: Briefcase,
    color: 'amber',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-800',
    watermarkColor: 'text-amber-900/[0.04]',
  },
  {
    title: 'Transparent Infrastructure',
    desc: 'Zero speculation, audit-compliant transaction records, protected user wallets, and instant settlement channels.',
    icon: Lock,
    color: 'blue',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-800',
    watermarkColor: 'text-blue-900/[0.04]',
  },
];

const values = [
  {
    title: 'Transparency First',
    desc: 'Every commission, partnership, and investment agreement is backed by formal, clear terms and verifiable rules.',
    icon: Award,
  },
  {
    title: 'Collaborative Growth',
    desc: 'We believe real wealth is built through mentorship, collective teamwork, and shared operational success.',
    icon: Users,
  },
  {
    title: 'Sustainable Economics',
    desc: 'No unrealistic hype or speculation — only authentic commercial activity from real products and services.',
    icon: Zap,
  },
  {
    title: 'Institutional Security',
    desc: 'Bank-grade encryption, secure wallet infrastructure, and formal investor protections across all programs.',
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col justify-between">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#011a11] via-[#01281a] to-[#00170f] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/hero-banner-ecosystem.jpg"
            alt="EarnX Capital Banner"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#011a11] via-transparent to-[#011a11]/90" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6 z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ABOUT EARNX CAPITAL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            One Platform.{' '}
            <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-400 bg-clip-text text-transparent">
              Multiple Opportunities.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed">
            EarnX Capital is a digital business platform connecting products, services, customers and
            business opportunities in one unified ecosystem.
          </p>
        </div>
      </section>

      {/* 2. Mission & Narrative Section */}
      <section className="py-20 sm:py-28 bg-[#f8fbf9] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-emerald-700 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                OUR PHILOSOPHY
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                Your Business.{' '}
                <span className="text-[#01281a]">Your Opportunity.</span>{' '}
                <span className="text-[#b38e1b]">Your Growth.</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-700 font-bold leading-relaxed">
                Whether you want to buy, sell, market, build a team or explore investment opportunities, EarnX gives you a platform to grow.
              </p>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                Founded on principles of commercial transparency and mutual empowerment, EarnX Capital eliminates the silos of modern business. We integrate e-commerce storefronts, high-converting affiliate marketing, multi-tier team leadership, agency growth engines, and formal investment mechanisms under one trusted roof.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold text-slate-800">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Curated Marketplace</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fair Commission Overrides</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Formal Agreement Process</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enterprise Agency Suite</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
              <ShieldCheck className="absolute -top-6 -right-6 w-40 h-40 text-slate-900/[0.03] pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#01281a] text-[#f3ba2f] flex items-center justify-center shadow-md">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-950">Our Mission</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                  To democratize digital commerce and wealth-building by providing accessible, structured, and legally transparent pathways for entrepreneurs, creators, leaders, and investors globally.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Serving global members with real business value</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Ecosystem Pillars */}
      <section className="py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-emerald-700 font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-2">
              THE PLATFORM ENGINE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              6 Core Ecosystem Pillars
            </h2>
            <p className="mt-3 text-base text-slate-600 font-medium">
              Every component of EarnX Capital is engineered for seamless cross-collaboration and reliable performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden p-7 rounded-3xl bg-[#f8fbf9] border border-slate-200/90 hover:border-emerald-400/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <Icon className={`absolute -top-3 -right-3 w-28 h-28 ${item.watermarkColor} group-hover:scale-105 transition-all pointer-events-none`} />

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl ${item.badgeClass} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-950 mb-2 group-hover:text-[#01281a] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Core Values Grid */}
      <section className="py-20 sm:py-24 bg-[#f8fbf9] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-emerald-700 font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-2">
              WHY WE DO IT
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Our Guiding Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-[#01281a] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-950 mb-2">
                    {val.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Final CTA on About Page */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#01281a] via-[#023c28] to-[#012015] p-8 sm:p-14 text-center text-white border border-emerald-900/60 shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to grow with EarnX Capital?
            </h2>
            <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-medium">
              Create your account in 2 minutes and start exploring marketplace products, affiliate opportunities, or structured capital options.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-[#f3ba2f] hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all group"
              >
                <span>Join EarnX Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all"
              >
                <span>Contact Support</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
