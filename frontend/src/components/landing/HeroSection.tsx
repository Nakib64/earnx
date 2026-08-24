'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  Building2,
  Globe,
} from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center bg-[#011a11] text-white">
      {/* Background Banner Image with Premium Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-banner-ecosystem.jpg"
          alt="EarnX Capital Ecosystem"
          className="w-full h-full object-cover object-center opacity-45 scale-105 transform duration-1000 ease-out"
        />
        {/* Deep Emerald & Vignette Overlays for Crisp Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#011f15] via-[#01281a]/90 to-[#00170f]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#011a11] via-transparent to-[#011f15]/80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="order-2 lg:order-1 lg:col-span-7 space-y-6 text-left"
          >
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              EarnX Capital{' '}
              <span className="block text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-400 drop-shadow-sm">
                One Platform. Multiple Opportunities.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-200 font-medium max-w-xl leading-relaxed">
              A digital business ecosystem where marketplace, sales &amp; marketing, team-based business and investment opportunities come together.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#f3ba2f] via-[#e5c158] to-[#d4af37] hover:brightness-110 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all duration-200 group"
              >
                <span>Join EarnX Now</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/#marketplace"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-amber-300/60 font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-200 group"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: High-Tech Ecosystem Holographic Glass Card (First on Mobile) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="order-1 lg:order-2 lg:col-span-5 relative"
          >
            <div className="relative p-7 sm:p-8 rounded-3xl bg-white/[0.07] border border-white/20 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
              {/* Subtle top watermark */}
              <Building2 className="absolute -top-6 -right-6 w-36 h-36 text-white/[0.04] pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">EarnX Unified Core</h3>
                    <p className="text-xs text-slate-300 font-medium">Live Business Operations</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                  Active
                </span>
              </div>

              {/* 4 Ecosystem Pillars Live Pulse */}
              <div className="space-y-3.5 py-6">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Marketplace Engine</div>
                      <div className="text-[11px] text-slate-400">Products &amp; Verified Vendors</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-300">E-Commerce</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Sales &amp; Marketing</div>
                      <div className="text-[11px] text-slate-400">Affiliate Commission Routing</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-300">Instant</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Team-Based Network</div>
                      <div className="text-[11px] text-slate-400">Mentorship &amp; Overrides</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-300">Collaborative</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Structured Investment</div>
                      <div className="text-[11px] text-slate-400">Formal Legal Agreements</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-300">Protected</span>
                </div>
              </div>

              {/* Bottom Quick Metrics Line */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Global Reach</span>
                </span>
                <span className="text-amber-200">Zero Speculation • Real Business</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
