'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  ShoppingBag,
  TrendingUp,
  Megaphone,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

const reasons = [
  {
    title: 'Multiple Opportunities',
    tag: 'Ecosystem Diversity',
    desc: 'Different ways to participate and grow across marketplace commerce, performance marketing, team leadership, and structured investments.',
    highlights: ['Multi-channel revenue', 'Flexible participation', 'Unified single account'],
    icon: Layers,
    bgGradient: 'from-emerald-50/60 via-white to-white',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30',
    watermarkColor: 'text-emerald-900/[0.04]',
    colSpan: 'lg:col-span-7',
  },
  {
    title: 'Marketplace Access',
    tag: 'Commerce & Solutions',
    desc: 'Buy, sell and discover products and services from verified merchants with built-in escrow protection.',
    highlights: ['Curated vendor catalog', 'Digital & tangible products', 'Instant checkout'],
    icon: ShoppingBag,
    bgGradient: 'from-amber-50/60 via-white to-white',
    borderColor: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-500/15 text-amber-800 border border-amber-500/30',
    watermarkColor: 'text-amber-900/[0.04]',
    colSpan: 'lg:col-span-5',
  },
  {
    title: 'Business Growth',
    tag: 'Network Scale',
    desc: 'Build your network and expand your business through collaborative team leadership and tiered overrides.',
    highlights: ['Mentorship pathways', 'Leadership rewards', 'Expanding downline reach'],
    icon: TrendingUp,
    bgGradient: 'from-blue-50/60 via-white to-white',
    borderColor: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-500/15 text-blue-800 border border-blue-500/30',
    watermarkColor: 'text-blue-900/[0.04]',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Marketing Opportunities',
    tag: 'Active Commissions',
    desc: 'Turn successful sales and marketing into earning opportunities with automated real-time tracking.',
    highlights: ['High-converting offers', 'Direct commission payouts', 'Full marketing toolkit'],
    icon: Megaphone,
    bgGradient: 'from-emerald-50/60 via-white to-white',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30',
    watermarkColor: 'text-emerald-900/[0.04]',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Professional Services',
    tag: 'Agency Grade',
    desc: 'Access quality agency and business solutions to build your brand and dominate online search.',
    highlights: ['Digital ad management', 'Web & branding suite', 'SEO & social strategies'],
    icon: Briefcase,
    bgGradient: 'from-amber-50/60 via-white to-white',
    borderColor: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-500/15 text-amber-800 border border-amber-500/30',
    watermarkColor: 'text-amber-900/[0.04]',
    colSpan: 'lg:col-span-4',
  },
];

export default function WhyEarnXSection() {
  return (
    <section className="py-24 sm:py-32 bg-[#f8fbf9] text-slate-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
         

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight"
          >
            Why Choose EarnX?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto"
          >
            Engineered to empower individuals, brands, leaders, and strategic investors with real business opportunities.
          </motion.p>
        </div>

        {/* Large Bento Grid of Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative overflow-hidden ${item.colSpan} p-8 sm:p-10 lg:p-12 rounded-[32px] bg-gradient-to-br ${item.bgGradient} border ${item.borderColor} shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group`}
              >
                {/* Large Watermark Icon in Top-Right Corner with opacity */}
                <Icon
                  className={`absolute -top-6 -right-6 w-36 h-36 sm:w-44 sm:h-44 ${item.watermarkColor} group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Top Row: Icon Badge & Category Tag */}
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl ${item.iconBg} backdrop-blur-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 stroke-[2.2]" />
                    </div>

                    <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-slate-800 shadow-2xs">
                      {item.tag}
                    </span>
                  </div>

                  {/* Large Card Title */}
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-4 tracking-tight group-hover:text-[#01281a] transition-colors">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Highlight Points Checklist */}
                <div className="relative z-10 pt-6 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {item.highlights.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
