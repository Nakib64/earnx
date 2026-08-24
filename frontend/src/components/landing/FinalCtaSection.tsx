'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Gift,
  Sparkles,
} from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section className="py-12 sm:py-16 bg-white text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-[#01281a] via-[#023c28] to-[#012015] p-8 sm:p-12 border border-emerald-900/60 shadow-2xl shadow-emerald-950/20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          {/* Subtle Ambient background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left: Graphic + Title + Description */}
          <div className="flex items-center space-x-6 relative z-10 text-left">
            <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-[#f3ba2f] p-0.5 shadow-lg shrink-0 items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-[#01281a] flex items-center justify-center">
                <Gift className="w-9 h-9 text-[#f3ba2f]" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Your Opportunity Starts Here!
              </h2>
              <p className="mt-2 text-sm sm:text-base text-emerald-100/90 max-w-xl font-medium">
                Join EarnX Capital today and explore new ways to build, grow and earn with us.
              </p>
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-10">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-4 rounded-xl bg-[#f3ba2f] hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <span>Join EarnX Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/25 font-bold text-sm transition-all duration-200 group"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
