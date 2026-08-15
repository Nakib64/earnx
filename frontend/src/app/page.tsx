'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { InvestmentPlan, LeaderboardEntry } from '../types';
import Footer from '../components/Footer';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  BarChart3,
  Lock,
  Coins,
  ChevronRight,
  ChevronDown,
  Activity,
  Globe,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Framer Motion Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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

export default function Homepage() {
  const { user } = useAuth();

  // Backend Data States
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  // UI Interactive States
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'deposits' | 'roi'>('withdrawals');

  // Fetch real data from backend API
  useEffect(() => {
    const fetchBackendData = async () => {
      setLoadingPlans(true);
      setLoadingLeaders(true);

      try {
        const [plansRes, leadersRes] = await Promise.all([
          apiFetch<InvestmentPlan[]>('/investments/plans'),
          apiFetch<any>('/leaderboard'),
        ]);

        if (plansRes.success && Array.isArray(plansRes.data)) {
          setPlans(plansRes.data);
        }

        if (leadersRes.success) {
          if (Array.isArray(leadersRes.data)) {
            setLeaders(leadersRes.data.slice(0, 3));
          } else if (leadersRes.data?.data && Array.isArray(leadersRes.data.data)) {
            setLeaders(leadersRes.data.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load backend homepage data', err);
      } finally {
        setLoadingPlans(false);
        setLoadingLeaders(false);
      }
    };

    fetchBackendData();
  }, []);

  const getPhotoUrl = (url?: string | null) => {
    if (!url) return `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80`;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const faqs = [
    {
      question: 'How does EarnX generate daily returns for investors?',
      answer:
        'EarnX leverages institutional algorithmic trading, liquidity provision across top exchange order books, and native EarnX Coin (EXC) staking yield pools to generate steady, risk-managed daily returns for platform members.',
    },
    {
      question: 'What are the minimum deposit limits and withdrawal speeds?',
      answer:
        'You can start investing from as low as ৳500 on our Starter Tier. All withdrawal requests are processed automatically via automated smart-contracts and direct payment gateways, taking anywhere from instant execution to under 15 minutes.',
    },
    {
      question: 'What is EarnX Coin (EXC) and what utility does it provide?',
      answer:
        'EXC is EarnX’s native high-utility digital asset. Holding and staking EXC unlocks boosted daily ROI rates (+0.5% to +1.5%), zero-fee internal transfers, exclusive access to VIP investment tiers, and governance voting rights.',
    },
    {
      question: 'How safe is my capital and personal information on EarnX?',
      answer:
        'Security is our highest priority. 95% of digital assets are stored in multi-signature cold storage vaults. Our infrastructure is protected by 256-bit SSL encryption, Cloudflare DDoS defense, multi-factor authentication (2FA), and continuous security audits.',
    },
  ];

  const recentTransactions = {
    withdrawals: [
      { user: 'usr_8492***', amount: '৳125,000.00', time: '2 mins ago', tx: '0x8f...39a1', status: 'Completed' },
      { user: 'usr_3910***', amount: '৳380,000.00', time: '5 mins ago', tx: '0x4c...e29b', status: 'Completed' },
      { user: 'usr_1048***', amount: '৳62,000.00', time: '9 mins ago', tx: '0x9a...71d4', status: 'Completed' },
      { user: 'usr_5721***', amount: '৳415,000.00', time: '14 mins ago', tx: '0x1e...88c0', status: 'Completed' },
    ],
    deposits: [
      { user: 'usr_7729***', amount: '৳250,000.00', time: '1 min ago', tx: '0x3a...11f8', status: 'Confirmed' },
      { user: 'usr_2041***', amount: '৳50,000.00', time: '4 mins ago', tx: '0x7b...99c2', status: 'Confirmed' },
      { user: 'usr_9103***', amount: '৳1,000,000.00', time: '7 mins ago', tx: '0x5d...33e6', status: 'Confirmed' },
      { user: 'usr_6632***', amount: '৳180,000.00', time: '11 mins ago', tx: '0x2f...44a9', status: 'Confirmed' },
    ],
    roi: [
      { user: 'usr_1109***', amount: '+৳14,500.00 ROI', time: 'Just now', tx: 'Staking Yield', status: 'Credited' },
      { user: 'usr_8834***', amount: '+৳31,250.00 ROI', time: '3 mins ago', tx: 'Pro Tier Return', status: 'Credited' },
      { user: 'usr_4491***', amount: '+৳89,000.00 ROI', time: '6 mins ago', tx: 'VIP Tier Return', status: 'Credited' },
      { user: 'usr_3312***', amount: '+৳7,500.00 ROI', time: '10 mins ago', tx: 'Starter Return', status: 'Credited' },
    ],
  };

  // Fallback plans if backend array is empty during initial setup
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 'starter',
      title: 'Starter Package',
      amount: 1000,
      min_amount: 1000,
      max_amount: 10000,
      monthly_return_percent: 8,
      duration_months: 12,
      is_lifetime: false,
    },
    {
      id: 'pro-growth',
      title: 'Pro Growth Package',
      amount: 5000,
      min_amount: 5000,
      max_amount: 50000,
      monthly_return_percent: 12,
      duration_months: 12,
      is_lifetime: false,
    },
    {
      id: 'vip-elite',
      title: 'VIP Elite Package',
      amount: 25000,
      min_amount: 25000,
      max_amount: 250000,
      monthly_return_percent: 18,
      duration_months: 12,
      is_lifetime: true,
    },
  ];

  // Fallback leaders if backend array is empty during initial setup
  const displayLeaders = leaders.length > 0 ? leaders : [
    {
      id: '1',
      rank: 1,
      name: 'Jahid Hasan',
      invested_amount: 1256800,
      profit_earned: 450000,
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      rank: 2,
      name: 'Meraz Hossain',
      invested_amount: 985400,
      profit_earned: 320000,
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      rank: 3,
      name: 'Anutam Roy',
      invested_amount: 763200,
      profit_earned: 245000,
      photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 overflow-x-hidden flex flex-col justify-between">
      <div className="pb-16">
        {/* 1. HERO SECTION (Framer Motion Staggered Entry) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/7.5] min-h-[240px] sm:min-h-[380px] lg:min-h-[540px] bg-[#001710] overflow-hidden shadow-2xl"
        >
          <img
            src="/hero-banner.jpg"
            alt="EarnX Capital Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
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
                  Grow Your <br />
                  Wealth With <br />
                  <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                    EarnX
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-slate-200 text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-snug sm:leading-relaxed"
                >
                  Smart digital asset management with a premium experience.
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
                      href="/dashboard/coins"
                      className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#001710]/70 hover:bg-[#023322] text-slate-200 hover:text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl border border-slate-600/70 hover:border-[#d4af37]/60 transition-all backdrop-blur-sm"
                    >
                      EarnX Coin
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeInUp} className="pt-2 sm:pt-4 lg:pt-6 flex flex-wrap items-center gap-3 sm:gap-6 border-t border-[#053d29]/80 text-white text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                      ].map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt="User"
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-900 object-cover"
                        />
                      ))}
                    </div>
                    <span>25K+ Active Members</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>100% Verified Ledger</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* LOWER SECTIONS */}
        <div className="space-y-14 sm:space-y-20 pt-10 sm:pt-14">
          {/* 2. CRYPTO MARKET TICKER CARD */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 transition-all duration-300 hover:border-[#d4af37]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center space-x-4 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center p-2 shadow-md">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs border border-amber-200 shadow-inner font-mono">
                      EX
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-white">EarnX Coin</h3>
                      <span className="text-xs font-bold text-slate-400 font-mono">(EXC)</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                        $184.56
                      </span>
                      <span className="text-xs font-black text-[#10b981] font-mono">
                        +7.35% (24h)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md h-16 relative flex items-center">
                  <svg className="w-full h-full text-[#10b981]" viewBox="0 0 300 60" fill="none">
                    <path
                      d="M0 45 L25 35 L50 40 L75 25 L100 30 L125 15 L150 20 L175 10 L200 25 L225 15 L250 20 L275 5 L300 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0 45 L25 35 L50 40 L75 25 L100 30 L125 15 L150 20 L175 10 L200 25 L225 15 L250 20 L275 5 L300 12 V 60 H 0 Z"
                      fill="url(#solGradient)"
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient id="solGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shrink-0 border-t lg:border-t-0 lg:border-l border-[#053d29] pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Market Cap</span>
                    <span className="font-mono font-black text-white">$83.45B</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">24h Volume</span>
                    <span className="font-mono font-black text-white">$3.21B</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Rank</span>
                    <span className="font-mono font-black text-amber-300">#5</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Circulating Supply</span>
                    <span className="font-mono font-black text-white">453.96M EXC</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* 3. 4 FEATURE CARDS SECTION */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Secure Account',
                  desc: 'Advanced encryption and multi-layer security to protect your assets.',
                },
                {
                  icon: BarChart3,
                  title: 'Smart Dashboard',
                  desc: 'Real-time analytics and insights to track your portfolio performance.',
                },
                {
                  icon: Zap,
                  title: 'Fast Transactions',
                  desc: 'Experience lightning-fast deposits, withdrawals and transfers.',
                },
                {
                  icon: Users,
                  title: 'Team Management',
                  desc: 'Powerful tools to build, manage and grow your winning team.',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={cardItem}
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-6 text-center space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center mx-auto transition-all shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ========================================================================= */}
          {/* INVESTMENT PLANS (FETCHED FROM BACKEND API & FRAMER MOTION ANIMATED) */}
          {/* ========================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
          >
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Investment Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Choose from our official backend investment packages with transparent monthly yields and capital returns.
              </p>
            </div>

            {loadingPlans ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/30 rounded-3xl p-7 text-white space-y-5 animate-pulse shadow-xl"
                  >
                    <div className="h-6 w-1/2 bg-[#03442e] rounded-lg"></div>
                    <div className="h-16 bg-[#011f15] border border-[#d4af37]/20 rounded-2xl p-4"></div>
                    <div className="h-12 bg-amber-400/20 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
              >
                {displayPlans.map((plan, idx) => {
                  const amt = Number(plan.amount || plan.min_amount || 0);
                  const returnPct = Number(plan.monthly_return_percent || 0);
                  const monthlyVal = (amt * returnPct) / 100;
                  const isFeatured = idx === 1;

                  return (
                    <motion.div
                      key={plan.id}
                      variants={cardItem}
                      whileHover={{ scale: 1.03, y: -6 }}
                      className={`rounded-3xl p-7 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl ${isFeatured
                          ? 'bg-gradient-to-b from-[#023322] via-[#01261a] to-[#001710] border-2 border-[#d4af37] text-white'
                          : 'bg-white border border-slate-200/90 text-slate-900 hover:border-[#023322]/40'
                        }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200/20 pb-3">
                          <h3 className={`text-xl font-black ${isFeatured ? 'text-white' : 'text-slate-900'}`}>
                            {plan.title}
                          </h3>
                          <span className={`text-xs font-mono font-bold ${isFeatured ? 'text-amber-300' : 'text-emerald-700'}`}>
                            {plan.is_lifetime ? 'Lifetime' : `${plan.duration_months || 12} Months`}
                          </span>
                        </div>

                        <div className={`p-4 rounded-2xl text-center border font-mono ${isFeatured
                            ? 'bg-[#001f16] border-[#d4af37]/40 text-amber-300'
                            : 'bg-slate-50 border-slate-200 text-[#023322]'
                          }`}>
                          <div className="text-3xl font-black">
                            ৳{amt.toLocaleString()}
                          </div>
                          <div className="text-xs font-semibold mt-0.5 text-slate-400">
                            Monthly Return: <strong className={isFeatured ? 'text-white' : 'text-slate-800'}>{returnPct}%</strong>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs font-medium pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Estimated Dividend:</span>
                            <span className={`font-mono font-black ${isFeatured ? 'text-amber-200' : 'text-slate-900'}`}>
                              ৳{monthlyVal.toLocaleString()} / mo
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Min Deposit:</span>
                            <span className="font-mono font-bold">৳{Number(plan.min_amount || amt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Capital Return:</span>
                            <span className="font-bold">100% Principal Intact</span>
                          </div>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          href={user ? '/dashboard/investments' : '/register'}
                          className={`w-full text-center py-3.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 ${isFeatured
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
                              : 'bg-slate-900 hover:bg-[#023322] text-white'
                            }`}
                        >
                          <span>Invest Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.section>

          {/* 4. SPLIT BANNER & TOP LEADERS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 bg-gradient-to-br from-[#023322] via-[#012418] to-[#011a12] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden space-y-6"
              >
                <div className="space-y-3 relative z-10 max-w-md">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Build Your Future <br />
                    With <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">EarnX</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Invest in smart digital assets and grow your wealth with confidence.
                  </p>
                </div>

                <div className="relative z-10 pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      href="/dashboard/investments"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all"
                    >
                      <span>Explore Packages</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Top Leaders Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 text-slate-950 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#f3ba2f]" />
                    <span>Top Leaderboard</span>
                  </h3>
                  <Link
                    href="/dashboard/leaderboard"
                    className="text-xs font-bold text-[#023322] hover:text-emerald-950 flex items-center space-x-1 transition-colors"
                  >
                    <span>Full Leaderboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {loadingLeaders ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="h-14 bg-slate-100 animate-pulse rounded-2xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayLeaders.map((leader, index) => (
                      <motion.div
                        key={leader.id || index}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#023322]/30 transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="w-6 h-6 rounded-full font-black text-xs bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <img
                            src={getPhotoUrl(leader.photo_url)}
                            alt={leader.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{leader.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate">
                              Invested: ৳{Number(leader.invested_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-black text-xs text-[#023322] shrink-0 ml-2">
                          +৳{Number(leader.profit_earned).toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </section>

          {/* 5. HOW IT WORKS SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How It Works
            </h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  step: '01',
                  title: 'Create Account',
                  desc: 'Sign up in minutes and secure your profile.',
                },
                {
                  step: '02',
                  title: 'Add Balance',
                  desc: 'Deposit funds securely using gateway payment methods.',
                },
                {
                  step: '03',
                  title: 'Manage & Grow',
                  desc: 'Select packages, track yields and withdraw returns with ease.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={cardItem}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-[#f0f9f4] border border-[#cbe8d8] rounded-3xl p-6 text-left space-y-3 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-[#10b981]">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#cbe8d8] flex items-center justify-center text-[#033e28] shadow-xs">
                      {idx === 0 ? <Coins className="w-5 h-5" /> : idx === 1 ? <Wallet className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                    </div>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* 6. LIVE PLATFORM ACTIVITY & METRICS */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <motion.div variants={cardItem} whileHover={{ scale: 1.03 }} className="bg-[#012417] border border-[#d4af37]/30 rounded-3xl p-6 text-white text-center space-y-1 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#023322] border border-[#d4af37]/40 text-amber-300 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">৳14.8M+</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Paid Out</div>
              </motion.div>

              <motion.div variants={cardItem} whileHover={{ scale: 1.03 }} className="bg-[#012417] border border-[#d4af37]/30 rounded-3xl p-6 text-white text-center space-y-1 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#023322] border border-[#d4af37]/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">48,920</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Members</div>
              </motion.div>

              <motion.div variants={cardItem} whileHover={{ scale: 1.03 }} className="bg-[#012417] border border-[#d4af37]/30 rounded-3xl p-6 text-white text-center space-y-1 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#023322] border border-[#d4af37]/40 text-amber-300 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">135+</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Global Networks</div>
              </motion.div>

              <motion.div variants={cardItem} whileHover={{ scale: 1.03 }} className="bg-[#012417] border border-[#d4af37]/30 rounded-3xl p-6 text-white text-center space-y-1 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#023322] border border-[#d4af37]/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">99.99%</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Platform Security</div>
              </motion.div>
            </motion.div>

            {/* Live Activity Stream with AnimatePresence Tab Switch */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center space-x-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>Live Platform Activity</span>
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time verified transaction payouts and deposits</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {(['withdrawals', 'deposits', 'roi'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${activeTab === tab
                          ? 'bg-[#023322] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {tab === 'roi' ? 'Daily ROI' : tab}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {recentTransactions[activeTab].map((tx, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-[#023322]/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-mono text-xs font-black shrink-0">
                          <ArrowUpRight className="w-5 h-5 text-[#023322]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-900 font-mono">{tx.user}</span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {tx.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                            <span className="font-mono">{tx.tx}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tx.time}</span>
                          </div>
                        </div>
                      </div>

                      <span className="font-mono font-black text-sm text-slate-900 shrink-0 ml-3">
                        {tx.amount}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>

          {/* 7. FAQ & SECURITY PROTOCOL */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Find clear answers to how EarnX operates, how your investments grow, and how capital security is maintained.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className={`border rounded-2xl transition-all overflow-hidden ${isOpen
                        ? 'bg-white border-[#023322] shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-black text-slate-900 text-sm sm:text-base cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center shrink-0 font-mono ${isOpen ? 'bg-[#023322] text-amber-300' : 'bg-slate-100 text-slate-600'}`}>
                          0{idx + 1}
                        </span>
                        <span>{faq.question}</span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-[#023322]' : ''
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#053d29] pb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Bank-Grade Protection & Security Standard</h3>
                    <p className="text-xs text-slate-300 font-medium">Your assets and privacy are safeguarded by enterprise-tier crypto architecture.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs font-black text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Audited Security Infrastructure</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#023322] text-amber-300 flex items-center justify-center shrink-0 border border-[#d4af37]/30 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Cold Wallet Storage</h4>
                    <p className="text-slate-400 text-[11px] leading-snug mt-1">95% of digital assets are held offline in multi-signature cold vaults.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#023322] text-emerald-400 flex items-center justify-center shrink-0 border border-[#d4af37]/30 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Instant Automated Execution</h4>
                    <p className="text-slate-400 text-[11px] leading-snug mt-1">Smart-contracts execute deposits and withdrawal settlements with 0 delay.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#023322] text-amber-300 flex items-center justify-center shrink-0 border border-[#d4af37]/30 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">256-Bit SSL & 2FA</h4>
                    <p className="text-slate-400 text-[11px] leading-snug mt-1">End-to-end encrypted user communications and mandatory multi-factor auth.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* 8. CTA BANNER */}
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
                    Ready to take control of your portfolio?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                    Join EarnX Capital today and start your journey towards financial freedom.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end space-y-2 shrink-0">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={user ? '/dashboard' : '/register'}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl flex items-center space-x-2"
                  >
                    <span>Create Your Account</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* SMART FOOTER */}
      <Footer />
    </div>
  );
}
