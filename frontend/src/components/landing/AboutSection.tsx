'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
} from 'lucide-react';

const pillars = [
  {
    title: 'Products & Services',
    desc: 'Connecting verified merchants, products, and services directly with active buyers.',
    icon: ShoppingBag,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
  },
  {
    title: 'Sales & Marketing',
    desc: 'Direct commission earning pathways for independent marketers and sales partners.',
    icon: TrendingUp,
    color: 'amber',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-800',
    watermarkColor: 'text-amber-900/[0.04]',
  },
  {
    title: 'Team-Based Business',
    desc: 'Structured collaborative leadership framework to scale network volume together.',
    icon: Users,
    color: 'blue',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-800',
    watermarkColor: 'text-blue-900/[0.04]',
  },
  {
    title: 'Investment Opportunities',
    desc: 'Transparent capital allocation underpinned by formal legal agreement processes.',
    icon: ShieldCheck,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#f8fbf9] text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Core Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >

            {/* Main Section Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Your Business.{' '}
              <span className="text-[#01281a] block sm:inline">Your Opportunity.</span>{' '}
              <span className="bg-gradient-to-r from-[#01281a] via-[#025a3a] to-[#d4af37] bg-clip-text text-transparent">
                Your Growth.
              </span>
            </h2>

            {/* Lead Narrative */}
            <p className="text-lg sm:text-xl text-slate-700 font-bold leading-relaxed">
              EarnX Capital is a digital business platform connecting products, services, customers and
              business opportunities in one ecosystem.
            </p>

            <p className="text-base text-slate-600 font-medium leading-relaxed">
              Whether you want to buy, sell, market, build a team or explore investment opportunities,
              EarnX gives you a platform to grow.
            </p>

            {/* Key Benefits Checklist */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold text-slate-800">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unified Digital Ecosystem</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-Stream Earnings</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Formal Agreement Process</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Agency &amp; Business Solutions</span>
              </div>
            </div>

            {/* CTA linking directly to /about */}
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[#01281a] hover:bg-[#023c28] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-950/15 hover:shadow-xl transition-all duration-200 group"
              >
                <span>Discover EarnX</span>
                <ArrowRight className="w-4 h-4 text-[#f3ba2f] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 4 Connected Pillars Grid with Top-Right Watermark Icons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Top-Right Watermark Icon */}
                  <Icon className={`absolute -top-3 -right-3 w-24 h-24 ${pillar.watermarkColor} group-hover:scale-105 group-hover:opacity-15 transition-all pointer-events-none`} />

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl ${pillar.badgeClass} border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-950 mb-2 group-hover:text-[#01281a] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
