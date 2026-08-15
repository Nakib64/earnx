'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Headset,
  CheckCircle2,
  Send,
  Mail,
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-[#00140e] text-slate-300 border-t border-[#053d29] pt-14 pb-10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Brand Summary & Newsletter Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-5"
          >
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center text-[#f3ba2f] font-black text-xl font-mono shadow-md">
                EX
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Earn<span className="text-amber-400">X</span> Capital
              </span>
            </Link>

            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
              High-integrity digital asset management and multi-tier wealth growth platform. Built with enterprise cold-wallet security and real-time yield distribution.
            </p>

            {/* Live System Operational Indicator */}
            <div className="inline-flex items-center space-x-2 bg-[#01261a] border border-[#055c3c] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational • 99.99% Uptime</span>
            </div>
          </motion.div>

          {/* Newsletter Subscription Box */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Subscribe to Market Insights</span>
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                Get weekly market updates, EXC token staking yields, and exclusive investment plan releases.
              </p>
            </div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs font-black text-emerald-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! You have successfully subscribed to EarnX updates.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#001710] border border-[#055c3c] focus:border-amber-400 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-medium"
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Middle Links Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-[#053d29]/60 text-xs"
        >
          {/* Col 1: Platform Links */}
          <div className="space-y-3">
            <h5 className="font-black text-white uppercase tracking-wider text-[11px]">Platform</h5>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors">Homepage</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-300 transition-colors">User Dashboard</Link>
              </li>
              <li>
                <Link href="/dashboard/investments" className="hover:text-amber-300 transition-colors">Investment Packages</Link>
              </li>
              <li>
                <Link href="/dashboard/leaderboard" className="hover:text-amber-300 transition-colors">Top Leaders</Link>
              </li>
              <li>
                <Link href="/dashboard/coins" className="hover:text-amber-300 transition-colors">EarnX Coin (EXC)</Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Account & Earnings */}
          <div className="space-y-3">
            <h5 className="font-black text-white uppercase tracking-wider text-[11px]">Account & Staking</h5>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/register" className="hover:text-amber-300 transition-colors">Create Account</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-300 transition-colors">Member Sign In</Link>
              </li>
              <li>
                <Link href="/dashboard/wallet" className="hover:text-amber-300 transition-colors">My Wallet & Withdrawals</Link>
              </li>
              <li>
                <Link href="/dashboard/referral" className="hover:text-amber-300 transition-colors">Referral Commission</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Information */}
          <div className="space-y-3">
            <h5 className="font-black text-white uppercase tracking-wider text-[11px]">Company</h5>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">About EarnX</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300 transition-colors">24/7 Support</Link>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">Security Audits</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">Risk Disclosure</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Live EXC Asset Card */}
          <div className="bg-[#012015] border border-[#d4af37]/30 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-white text-xs">EarnX Coin</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-700/50">+7.35%</span>
            </div>
            <div className="text-xl font-black font-mono text-white">$184.56 USD</div>
            <p className="text-[10px] text-slate-400 leading-snug">Native platform utility token powering daily ROI boosts and zero-fee transfers.</p>
          </div>
        </motion.div>

        {/* Bottom Bar: Copyright & Security Pillars */}
        <div className="pt-8 border-t border-[#053d29]/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} EarnX Capital. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cold Wallet Storage
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> 256-Bit SSL Encryption
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Headset className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Desk
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
