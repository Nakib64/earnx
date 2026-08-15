'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
  Lock,
  Globe,
  CheckCircle2,
  Target,
  Cpu,
  Layers,
  BarChart3,
  UserCheck,
  Wallet,
  Coins,
  Repeat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 overflow-x-hidden flex flex-col justify-between">
      <div className="pb-16 space-y-16 sm:space-y-24">
        {/* 1. HERO SECTION (Identical structure & style to Homepage) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/7.5] min-h-[240px] sm:min-h-[380px] lg:min-h-[540px] bg-[#001710] overflow-hidden shadow-2xl"
        >
          <img
            src="/about-cover.jpg"
            alt="EarnX Capital Cover Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#001710]/95 via-[#001710]/75 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001710]/80 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 w-full h-full flex items-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-[62%] sm:max-w-[58%] lg:max-w-xl space-y-2 sm:space-y-4 lg:space-y-6 text-left"
              >
                <motion.h1
                  variants={fadeInUp}
                  className="text-sm xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1]"
                >
                  Pioneering <br />
                  Digital Finance <br />
                  <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                    Ecosystem
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-slate-200 text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-snug sm:leading-relaxed"
                >
                  Enterprise-grade digital asset platform engineered with ACID transaction accounting and 95% multi-sig cold vault security.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 pt-0.5 sm:pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={user ? '/dashboard' : '/register'}
                      className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#03442e] hover:bg-[#04593d] text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl flex items-center space-x-1 sm:space-x-2 border border-[#056343] transition-all shadow-xl"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard/investments"
                      className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#012417] hover:bg-[#023322] text-amber-300 font-bold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl flex items-center space-x-1 border border-[#d4af37]/40 transition-all shadow-md"
                    >
                      <span>Investment Plans</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 2. VISION & MISSION DUAL CARDS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Vision & Core Mission
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Delivering global financial independence through transparent technology and structured network yield.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <motion.div
              variants={cardItem}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-8 space-y-5 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center transition-all shadow-md">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                Global Financial Empowerment
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Our vision is to empower millions of independent investors worldwide with an accessible, high-yield digital asset ecosystem. We eliminate balance drift, opaque fees, and delayed payouts by maintaining strict database ACID transactions and automated network downline distribution.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero balance-drift transaction accounting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Decentralized 5-tier level commission depth</span>
                </li>
              </ul>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              variants={cardItem}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-8 space-y-5 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center transition-all shadow-md">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                Enterprise Security & Transparency
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Our mission is to build the standard for multi-level digital asset platforms. By combining multi-signature cold storage, mandatory 2FA, and full real-time downline analytics, every member can build long-term residual income with complete peace of mind.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>95% offline multi-sig cold vault asset storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant automated withdrawal & deposit execution</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. WORKING PROCESS SECTION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Working Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              4 simple steps to start growing your digital portfolio with EarnX Capital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up for free, verify your credentials, and get immediate access to your member dashboard.',
                icon: UserCheck,
              },
              {
                step: '02',
                title: 'Select Investment Plan',
                desc: 'Choose from our structured packages tailored for daily return yield and tree level commission unlocks.',
                icon: Wallet,
              },
              {
                step: '03',
                title: 'Automated Processing',
                desc: 'Your funds enter our isolated ACID database transaction ledger with real-time audit verification.',
                icon: Repeat,
              },
              {
                step: '04',
                title: 'Receive Yield & Commissions',
                desc: 'Collect daily portfolio yields and earn instant downline team referral commissions down to Level 5.',
                icon: Coins,
              },
            ].map((proc, idx) => {
              const IconComp = proc.icon;
              return (
                <motion.div
                  key={idx}
                  variants={cardItem}
                  whileHover={{ scale: 1.03, y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center transition-all shadow-md">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-300 group-hover:text-[#023824] transition-colors">
                      {proc.step}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                    {proc.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {proc.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 4. CORE PILLARS GRID */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              6 Core Pillars of EarnX Capital
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Engineered with strict financial safeguards and maximum transparency for all network members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'ACID Financial Ledger',
                desc: 'Every deposit, withdrawal, and level payout is processed inside isolated database transactions ensuring zero balance drift.',
              },
              {
                icon: Award,
                title: 'Star Designation Badges',
                desc: 'Earn status badges and unlock deeper tree level keys ranging from Level 1 up to Level 5 earning depths.',
              },
              {
                icon: Zap,
                title: 'Instant Automated Execution',
                desc: 'Commission credits apply immediately upon team downline activations with full audit tracking in your account ledger.',
              },
              {
                icon: ShieldCheck,
                title: 'Multi-Sig Cold Storage',
                desc: '95% of digital assets are secured in offline multi-signature vaults protected against online exploits.',
              },
              {
                icon: Layers,
                title: 'Live Downline Tree',
                desc: 'Track your active referral team across all 5 levels with visual breakdown indicators and active volume counters.',
              },
              {
                icon: Globe,
                title: 'Global Liquidity Pool',
                desc: 'Backed by active EXC token liquidity reserves and cross-border settlement channels ensuring smooth payouts.',
              },
            ].map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  variants={cardItem}
                  whileHover={{ scale: 1.03, y: -6 }}
                  className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center transition-all shadow-md">
                    <PillarIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 5. EXECUTIVE LEADERSHIP TEAM */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Executive Leadership & Advisory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Meet the specialists leading blockchain engineering, risk mitigation, and member growth.
            </p>
          </div>

         
        </motion.section>

        {/* 6. CTA BANNER (Identical to Homepage CTA) */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4 max-w-xl">
              <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Ready to start your wealth growth journey?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                  Join thousands of active network members earning daily yields and team downline commissions.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-2 shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={user ? '/dashboard' : '/register'}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl flex items-center space-x-2"
                >
                  <span>{user ? 'Open Dashboard' : 'Join EarnX Capital'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* SMART FOOTER */}
      <Footer />
    </div>
  );
}
