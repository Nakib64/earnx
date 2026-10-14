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
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

const pillars = [
  {
    word: 'Build',
    title: 'Assemble Your Network',
    desc: 'Invite motivated individuals, onboard new partners, and create an active commercial group.',
    icon: Users,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-[#009F6B] border-emerald-500/30',
  },
  {
    word: 'Lead',
    title: 'Mentor & Support',
    desc: 'Guide your members with training, product insights, and strategic marketing direction.',
    icon: Crown,
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  },
  {
    word: 'Grow',
    title: 'Scale Collective Volume',
    desc: 'Increase sales velocity across all tiers through unified campaigns and collaboration.',
    icon: TrendingUp,
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
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
    <section id="team-business" className="py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Collaborative Leadership</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Build Your Team.{' '}
              <span className="bg-gradient-to-r from-emerald-800 via-[#009F6B] to-amber-600 bg-clip-text text-transparent block sm:inline">
                Grow Together.
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-700 font-bold leading-relaxed">
              Create your own network and work collectively through marketplace sales, digital marketing, and commercial ventures.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Our collaborative structure rewards active mentorship and collective productivity. When your team succeeds, the entire network benefits through transparent, rule-based commission tiers.
            </p>

            {/* 4 Pillars Highlight Badges in GlassCard */}
            <GlassCard
              variant="standard"
              specular={true}
              className="p-5 specular-rim border-white/90"
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                Core Philosophy
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-black text-xs sm:text-sm text-slate-900">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 shadow-2xs">
                  Build
                </span>
                <span className="text-amber-500 font-extrabold">•</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 shadow-2xs">
                  Lead
                </span>
                <span className="text-amber-500 font-extrabold">•</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 shadow-2xs">
                  Grow
                </span>
                <span className="text-amber-500 font-extrabold">•</span>
                <span className="px-3 py-1 bg-gradient-to-r from-[#009F6B] to-[#01281a] text-white rounded-xl shadow-xs">
                  Earn
                </span>
              </div>
            </GlassCard>

            {/* CTA */}
            <div className="pt-2">
              <Link href="/register" className="inline-block">
                <GlassButton
                  variant="primary"
                  size="md"
                  className="bg-gradient-to-r from-[#009F6B] to-[#01281a] text-white shadow-md font-black text-xs sm:text-sm"
                >
                  <span>Explore Team Business</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 text-amber-300 shrink-0" />
                </GlassButton>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 4 Pillar Cards in GlassCards */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <GlassCard
                  key={idx}
                  variant="interactive"
                  specular={true}
                  glow={true}
                  className="p-6 flex flex-col justify-between group specular-rim shadow-[0_14px_34px_rgba(15,23,42,0.05)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Top-Right Watermark Icon */}
                  <Icon className="absolute -top-3 -right-3 w-24 h-24 text-emerald-950/[0.03] group-hover:scale-105 group-hover:opacity-10 transition-all pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-2xl ${item.badgeClass} border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-white/90 text-slate-800 border border-slate-200 shadow-2xs uppercase tracking-wider">
                        {item.word}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-1.5 group-hover:text-[#009F6B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
