'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, CheckCircle2, ShieldCheck, Award } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden grid-bg-pattern border-b border-slate-200/60" data-purpose="hero-section">
      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="md:inline-flex hidden items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>VERIFIED DIGITAL BUSINESS &amp; EARNING ECOSYSTEM</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-4xl mx-auto space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            EARNX CAPITAL<span className="text-emerald-600">.</span>
          </h1>

          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            <span className="text-slate-800">One Platform. </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500">
              Multiple Opportunities!
            </span>
          </p>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            A digital business ecosystem where marketplace commerce, performance marketing, team-based business, and structured investment opportunities come together.
          </p>
        </motion.div>

        {/* Call to Action Buttons */}
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
            <span>JOIN EARNX NOW</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border border-slate-300 shadow-sm transition-all hover:border-slate-400 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>EXPLORE MARKETPLACE</span>
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-md transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>NEED HELP? TALK TO US</span>
          </Link>
        </motion.div>

        {/* Trust Badges Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Instant Mobile Payouts</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>100% Escrow Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Official VIP Membership</span>
          </div>
        </motion.div>

        {/* Hero Glassmorphic Interactive Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-emerald-300 via-slate-200 to-transparent shadow-2xl"
        >
          <div className="bg-white rounded-[14px] p-6 sm:p-8 border border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Live Account Preview
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">
                  Unified Multi-Stream Balance
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Escrow Verified
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: EX-89241</span>
              </div>
            </div>

            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <p className="text-xs font-medium text-slate-500">Marketplace Sales</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">৳142,500.00</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
                  ↑ 18.4% this week
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <p className="text-xs font-medium text-slate-500">Direct Commission</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">৳38,200.00</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Automated payout
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <p className="text-xs font-medium text-slate-500">Team Overrides</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">৳84,910.00</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Tier 3 Rank Active
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-200 transition-colors"
              >
                <p className="text-xs font-medium text-emerald-800">Monthly Capital Yield</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-1">৳22,500.00</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Disbursed on 1st
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
