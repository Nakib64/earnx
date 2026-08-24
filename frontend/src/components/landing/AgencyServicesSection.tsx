'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Palette,
  Code2,
  Search,
  Share2,
  ArrowRight,
  Sparkles,
  Briefcase,
  Layers,
} from 'lucide-react';

const services = [
  {
    title: 'Digital Marketing',
    desc: 'Targeted performance campaigns, paid ads management, and lead-generation funnels engineered for high conversion.',
    icon: Megaphone,
    tag: 'Growth',
  },
  {
    title: 'Branding & Identity',
    desc: 'Memorable brand positioning, visual identity kits, logo typography, and corporate design assets.',
    icon: Palette,
    tag: 'Identity',
  },
  {
    title: 'Web Development',
    desc: 'High-speed, custom modern web applications, e-commerce storefronts, and secure web portals.',
    icon: Code2,
    tag: 'Technology',
  },
  {
    title: 'Search Engine Optimization (SEO)',
    desc: 'Data-driven technical SEO, on-page keyword optimization, and continuous organic ranking growth.',
    icon: Search,
    tag: 'Visibility',
  },
  {
    title: 'Social Media Management',
    desc: 'End-to-end content calendar planning, graphic creative production, and engaged community cultivation.',
    icon: Share2,
    tag: 'Engagement',
  },
];

export default function AgencyServicesSection() {
  return (
    <section id="agency" className="py-20 sm:py-28 bg-white text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-4"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
            <span>EarnX Agency Solutions</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight"
          >
            Grow Your Business With EarnX
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed"
          >
            Professional digital and business solutions to help brands reach more customers and grow online.
          </motion.p>

          {/* Service tags line */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider"
          >
            <span>Digital Marketing</span>
            <span className="text-[#d4af37] font-bold">•</span>
            <span>Branding</span>
            <span className="text-[#d4af37] font-bold">•</span>
            <span>Web Development</span>
            <span className="text-[#d4af37] font-bold">•</span>
            <span>SEO</span>
            <span className="text-[#d4af37] font-bold">•</span>
            <span>Social Media Management</span>
          </motion.div>
        </div>

        {/* 5 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-7 rounded-3xl bg-gradient-to-br from-[#FAFBF9] to-[#F1F6F3] border border-slate-200 hover:border-[#d4af37]/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-[#f3ba2f]" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white text-slate-700 border border-slate-200">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-950 mb-2 group-hover:text-[#01281a] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center text-xs font-bold text-[#01281a] group-hover:text-[#025a3a] transition-colors">
                  <span>Custom Strategy Included</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[#01281a] hover:bg-[#023c28] text-white font-bold text-sm shadow-md transition-all duration-200 group"
          >
            <span>Explore Agency Services</span>
            <ArrowRight className="w-4 h-4 text-[#f3ba2f] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
