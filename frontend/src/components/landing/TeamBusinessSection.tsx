'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Crown,
  Sparkles,
} from 'lucide-react';

const pillars = [
  {
    word: 'Build',
    title: 'Assemble Your Network',
    desc: 'Invite motivated individuals, onboard new partners, and create an active commercial group.',
    icon: Users,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
  },
  {
    word: 'Lead',
    title: 'Mentor & Support',
    desc: 'Guide your members with training, product insights, and strategic marketing direction.',
    icon: Crown,
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
  },
  {
    word: 'Grow',
    title: 'Scale Collective Volume',
    desc: 'Increase sales velocity across all tiers through unified campaigns and collaboration.',
    icon: TrendingUp,
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
  },
  {
    word: 'Earn',
    title: 'Tiered Incentives',
    desc: 'Receive eligible team commissions, leadership bonuses, and official designation rewards.',
    icon: Award,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
  },
];

export default function TeamBusinessSection() {
  return (
    <section id="team-business" className="py-20 sm:py-28 bg-white text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading & Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6"
          >
          
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Build Your Team.{' '}
              <span className="bg-gradient-to-r from-[#01281a] via-[#025a3a] to-[#d4af37] bg-clip-text text-transparent block sm:inline">
                Grow Together.
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-slate-700 font-semibold leading-relaxed">
              Create your own team and work together through sales, marketing and business activities.
            </p>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Our collaborative structure rewards true mentorship and collective productivity. When your
              team succeeds, the entire network benefits through transparent, rule-based commission tiers.
            </p>

            {/* 4 Pillars Highlight Badges */}
            <div className="p-5 rounded-2xl bg-[#f8fbf9] border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Core Philosophy
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-black text-sm text-slate-900">
                <span className="px-3 py-1 bg-white text-emerald-900 rounded-xl border border-emerald-200 shadow-2xs">
                  Build
                </span>
                <span className="text-[#d4af37] font-extrabold">•</span>
                <span className="px-3 py-1 bg-white text-amber-900 rounded-xl border border-amber-200 shadow-2xs">
                  Lead
                </span>
                <span className="text-[#d4af37] font-extrabold">•</span>
                <span className="px-3 py-1 bg-white text-blue-900 rounded-xl border border-blue-200 shadow-2xs">
                  Grow
                </span>
                <span className="text-[#d4af37] font-extrabold">•</span>
                <span className="px-3 py-1 bg-[#01281a] text-white rounded-xl shadow-xs">
                  Earn
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-[#01281a] hover:bg-[#023c28] text-white font-extrabold text-sm shadow-md transition-all duration-200 group"
              >
                <span>Explore Team Business</span>
                <ArrowRight className="w-4 h-4 text-[#f3ba2f] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 4 Pillar Cards with Top-Right Watermark Icons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden p-6 rounded-3xl bg-[#f8fbf9] border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Top-Right Watermark Icon */}
                  <Icon className="absolute -top-3 -right-3 w-24 h-24 text-slate-900/[0.04] group-hover:scale-105 group-hover:opacity-10 transition-all pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      {/* Transparent Glassy Icon Badge */}
                      <div className={`w-11 h-11 rounded-2xl ${item.badgeClass} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 shadow-2xs">
                        {item.word}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-950 mb-1.5 group-hover:text-[#01281a] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {item.desc}
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
