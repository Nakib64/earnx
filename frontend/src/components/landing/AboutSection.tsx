'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';

const pillars = [
  {
    icon: ShoppingBag,
    title: 'Products & Services',
    description:
      'Connecting verified merchants, authentic products, and digital utilities directly with buyers across the nation.',
    colorClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Sales & Marketing',
    description:
      'Direct commission earning pathways for independent digital marketers and aggressive sales leaders.',
    colorClass: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Users,
    title: 'Team-Based Business',
    description:
      'Structured collaborative leadership framework to scale network volume and unlock recurring designations.',
    colorClass: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ShieldCheck,
    title: 'Investment Opportunities',
    description:
      'Transparent capital allocation underpinned by formal legal agreements and predictable monthly returns.',
    colorClass: 'bg-emerald-50 text-emerald-600',
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 bg-white" data-purpose="ecosystem-pillars" id="ecosystem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Vision & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <span>CORE ECOSYSTEM ARCHITECTURE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Your Business. <br />
              <span className="text-emerald-600">Your Opportunity.</span> <br />
              Your Growth.
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              EarnX Capital is a modern digital platform unifying verified marketplace merchandise, performance marketing, team entrepreneurship, and structured investments.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Whether you want to shop securely with escrow, watch rewarded ads, build an affiliate team, or explore capital growth plans, EarnX delivers a secure, automated foundation.
            </p>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Unified Digital Ecosystem</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Multi-Stream Daily Earnings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Formal Agreement Process</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Automated Wallet Payouts</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 group"
              >
                <span>Discover EarnX</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 4 Pillar Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${pillar.colorClass} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
