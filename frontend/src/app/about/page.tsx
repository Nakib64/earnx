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
    desc: 'Connecting verified merchants, authentic merchandise, digital utilities, and high-demand consumer goods with built-in escrow protection.',
    icon: ShoppingBag,
    iconColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Sales & Affiliate Marketing',
    desc: 'Performance-driven marketing system giving independent sales partners verified products to promote and earn automated direct commissions.',
    icon: TrendingUp,
    iconColor: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Team-Based Business',
    desc: 'Collaborative leadership network empowering ambitious entrepreneurs to mentor partners and unlock tiered downline overrides.',
    icon: Users,
    iconColor: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Structured Investment',
    desc: 'Institutional-grade capital allocation governed by strict financial audits, bilateral legal notary agreements, and scheduled monthly returns.',
    icon: ShieldCheck,
    iconColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Agency & Digital Solutions',
    desc: 'Professional digital marketing, branding, web development, SEO, and social management to help brands reach massive audiences.',
    icon: Briefcase,
    iconColor: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Transparent Infrastructure',
    desc: 'Audited transactional ledgers, protected user cold wallets, instant mobile banking settlements, and 24/7 dedicated dispute desks.',
    icon: Lock,
    iconColor: 'bg-slate-100 text-slate-800',
  },
];

const values = [
  {
    title: 'Transparency First',
    desc: 'Every commission, partnership, and investment agreement is backed by formal, clear legal terms and verifiable rules.',
    icon: Award,
  },
  {
    title: 'Collaborative Growth',
    desc: 'We believe real wealth is built through mentorship, collective teamwork, and shared operational success.',
    icon: Users,
  },
  {
    title: 'Sustainable Economics',
    desc: 'No unrealistic hype or speculation — only authentic commercial activity generated from real products and services.',
    icon: Zap,
  },
  {
    title: 'Institutional Security',
    desc: 'High-grade encryption, secure wallet infrastructure, and formal investor protections across all programs.',
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FBFDFD] text-slate-800 antialiased selection:bg-emerald-500 selection:text-white flex flex-col min-h-screen">
      {/* 1. HERO HEADER */}
      <section className="relative pt-12 pb-20 overflow-hidden grid-bg-pattern border-b border-slate-200/60" data-purpose="about-hero">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ABOUT EARNX CAPITAL &amp; OUR MISSION</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-4xl mx-auto space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              OUR VISION<span className="text-emerald-600">.</span>
            </h1>

            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              <span className="text-slate-800">One Platform. </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500">
                Multiple Opportunities!
              </span>
            </p>

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed pt-2">
              EarnX Capital is a modern digital platform unifying verified marketplace merchandise, performance marketing, team entrepreneurship, and structured investments under one roof.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>GET STARTED TODAY</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border border-slate-300 shadow-sm transition-all hover:border-slate-400 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>EXPLORE MARKETPLACE</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. PHILOSOPHY & MISSION DUAL SECTION */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <span>OUR CORE PHILOSOPHY</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Your Business. <br />
                <span className="text-emerald-600">Your Opportunity.</span> <br />
                Your Growth.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Whether you want to shop securely with escrow, watch rewarded ads, build an affiliate team, or explore capital growth plans, EarnX delivers a secure, automated foundation.
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Founded on principles of commercial transparency and mutual empowerment, EarnX Capital eliminates the silos of modern business. We integrate curated e-commerce storefronts, high-converting affiliate marketing, multi-tier team leadership, agency growth engines, and formal investment mechanisms under one trusted roof.
              </p>

              {/* Checkpoints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Curated Marketplace</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fair Commission Overrides</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Formal Agreement Process</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enterprise Agency Suite</span>
                </div>
              </div>
            </motion.div>

            {/* Right Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm relative overflow-hidden"
            >
              <div className="space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Our Mission</h3>
                <p className="text-slate-600 font-normal leading-relaxed text-sm sm:text-base">
                  To democratize digital commerce and wealth-building by providing accessible, structured, and legally transparent pathways for entrepreneurs, creators, leaders, and investors globally.
                </p>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2.5 shadow-2xs">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Serving thousands of active members with real economic value</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. 6 CORE ECOSYSTEM PILLARS */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span>THE PLATFORM ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              6 Core Ecosystem Pillars
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Every component of EarnX Capital is engineered for seamless cross-collaboration and reliable performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl ${item.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. GUIDING PRINCIPLES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              <span>WHY WE DO IT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Guiding Principles
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Foundational pillars ensuring sustainable long-term value for every member, client, and investor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">{val.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA BANNER */}
      <section className="py-16 bg-slate-50/70 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 text-xs font-semibold mb-4">
                  <span>JOIN THE ECOSYSTEM TODAY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                  Join thousands of verified members across Bangladesh. Watch rewarded ads, scale sales, lead teams, or activate capital growth plans today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 text-center transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  Join EarnX Now →
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 text-center transition-all active:scale-95"
                >
                  Contact Desk
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
