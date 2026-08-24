'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const cards = [
  {
    number: '01',
    title: 'Sales & Marketing',
    desc: 'Promote products and services, generate sales and earn attractive commissions.',
    points: ['Verified product catalog', 'Automated commission tracking', 'High conversion rates'],
    icon: ShoppingBag,
    bgColor: 'bg-gradient-to-br from-[#f2faf5] via-[#eef8f2] to-[#e6f4ec]',
    borderColor: 'border-emerald-200/90 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
    linkColor: 'text-emerald-800 hover:text-emerald-950',
    btnBg: 'bg-[#01281a] hover:bg-[#023c28] text-white',
    href: '/register',
  },
  {
    number: '02',
    title: 'Team-Based Business',
    desc: 'Build your team, work together and earn team commissions, bonuses and incentives.',
    points: ['Tiered team overrides', 'Leadership rank bonuses', 'Collaborative mentorship'],
    icon: Users,
    bgColor: 'bg-gradient-to-br from-[#f2f7ff] via-[#ebf3fe] to-[#e0edfd]',
    borderColor: 'border-blue-200/90 hover:border-blue-400',
    iconBg: 'bg-blue-500/15 border border-blue-500/30 text-blue-800',
    watermarkColor: 'text-blue-900/[0.04]',
    linkColor: 'text-blue-800 hover:text-blue-950',
    btnBg: 'bg-[#01281a] hover:bg-[#023c28] text-white',
    href: '/register',
  },
  {
    number: '03',
    title: 'Investment Opportunities',
    desc: 'Invest with EarnX Capital through structured programs and earn attractive returns.',
    points: ['Formal legal agreements', 'Institutional due diligence', 'Clear scheduled returns'],
    icon: TrendingUp,
    bgColor: 'bg-gradient-to-br from-[#fffdf2] via-[#fef9e2] to-[#fbf1cc]',
    borderColor: 'border-amber-200/90 hover:border-amber-400',
    iconBg: 'bg-amber-500/15 border border-amber-500/30 text-amber-800',
    watermarkColor: 'text-amber-900/[0.04]',
    linkColor: 'text-amber-800 hover:text-amber-950',
    btnBg: 'bg-[#01281a] hover:bg-[#023c28] text-white',
    href: '#investment',
  },
];

export default function WaysToEarnSection() {
  return (
    <section id="opportunities" className="py-20 sm:py-28 bg-white text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight"
          >
            Your Opportunities. Your Choice.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto"
          >
            Select your preferred participation model or combine multiple streams to maximize your business growth.
          </motion.p>
        </div>

        {/* 3 Large, Spacious Tinted Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`relative overflow-hidden rounded-[32px] ${card.bgColor} border ${card.borderColor} p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group`}
              >
                {/* Large Watermark Icon in Top-Right Corner with opacity */}
                <Icon
                  className={`absolute -top-6 -right-6 w-36 h-36 sm:w-40 sm:h-40 ${card.watermarkColor} group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Transparent Glassy Icon Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl ${card.iconBg} backdrop-blur-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700">
                      Option {card.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3 tracking-tight group-hover:text-[#01281a] transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                    {card.desc}
                  </p>

                  {/* Checklist Points */}
                  <div className="space-y-2.5 pt-4 border-t border-black/5 mb-8">
                    {card.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2.5 text-xs sm:text-sm font-bold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="relative z-10">
                  <Link
                    href={card.href}
                    className={`w-full inline-flex items-center justify-center space-x-2 py-4 rounded-xl font-extrabold text-sm ${card.btnBg} shadow-md hover:shadow-lg transition-all duration-200 group-hover:brightness-105`}
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
