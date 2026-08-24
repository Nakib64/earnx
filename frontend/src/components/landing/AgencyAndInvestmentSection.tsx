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
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Coins,
  Lock,
  Building2,
  Sparkles,
} from 'lucide-react';

const agencyItems = [
  { label: 'Digital Marketing', icon: Megaphone },
  { label: 'Branding & Design', icon: Palette },
  { label: 'Web Development', icon: Code2 },
  { label: 'SEO & Content', icon: Search },
  { label: 'Social Media Management', icon: Share2 },
  { label: 'Business Solutions', icon: Briefcase },
];

export default function AgencyAndInvestmentSection() {
  return (
    <section className="py-16 sm:py-24 bg-white text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Our Agency Services */}
          <motion.div
            id="agency"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8fbf9] to-[#edf6f1] border border-slate-200/90 p-8 sm:p-10 flex flex-col justify-between hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group"
          >
            {/* Top-Right Watermark Icon */}
            <Briefcase className="absolute -top-4 -right-4 w-32 h-32 text-emerald-900/[0.05] group-hover:opacity-15 group-hover:scale-105 transition-all pointer-events-none" />

            <div className="relative z-10">
             

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
                Our Agency Services
              </h2>
              <p className="text-sm text-slate-600 font-medium mb-8">
                We provide professional digital &amp; business solutions to help your brand grow.
              </p>

              {/* 6 Grid Service Badges with Transparent Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-8">
                {agencyItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 flex flex-col items-center text-center group/item hover:border-emerald-500/50 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center mb-2.5 group-hover/item:bg-[#01281a] group-hover/item:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-snug">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10">
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-extrabold text-sm shadow-xs transition-all group"
              >
                <span>Explore All Services</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Investment Opportunities */}
          <motion.div
            id="investment"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fbf9f4] to-[#f4eee2] border border-amber-200/80 p-8 sm:p-10 flex flex-col justify-between hover:shadow-xl hover:border-amber-300 transition-all duration-300 group"
          >
            {/* Top-Right Watermark Icon */}
            <ShieldCheck className="absolute -top-4 -right-4 w-32 h-32 text-amber-900/[0.05] group-hover:opacity-15 group-hover:scale-105 transition-all pointer-events-none" />

            <div className="relative z-10">
             

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
                Investment Opportunities
              </h2>

              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Explore structured investment opportunities with clear terms and a formal agreement process and earn attractive returns.
              </p>

              {/* Visual Box: Formal Security & Capital Assurance */}
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>Formal Agreement &amp; Bilateral Signing</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span>Clear Timelines &amp; Scheduled Disbursements</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-700 flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span>Regulated Institutional Governance</span>
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-[#01281a] text-white flex flex-col items-center justify-center text-center shadow-md border border-[#d4af37]/40 shrink-0">
                  <Building2 className="w-7 h-7 text-[#f3ba2f] mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-200">Capital</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <Link
                href="/dashboard/investments"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#01281a] hover:bg-[#023c28] text-white font-extrabold text-sm shadow-md transition-all group"
              >
                <span>Explore Investment</span>
                <ArrowRight className="w-4 h-4 text-[#f3ba2f] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
