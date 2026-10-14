'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalCtaSection() {
  return (
    <section className="py-16 bg-white" data-purpose="call-to-action-banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl"
        >
          {/* Ambient Light Accents */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 text-xs font-semibold mb-4">
                <span>GET STARTED IN 2 MINUTES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Your Opportunity Starts Here!
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                Join thousands of verified members across Bangladesh. Watch rewarded ads, scale sales, lead teams, or activate capital growth plans today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 text-center transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                Join EarnX Now →
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 text-center transition-all active:scale-95"
              >
                Contact Desk
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
