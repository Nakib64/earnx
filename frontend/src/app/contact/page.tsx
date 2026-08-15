'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Headset,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
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

const faqs = [
  {
    q: 'How fast are withdrawal requests processed?',
    a: 'Withdrawals are monitored by our automated financial ledger. Automated payouts for verified accounts process instantly or within 15–30 minutes depending on network congestion.',
  },
  {
    q: 'How do 5-level referral commissions work?',
    a: 'When your direct invite activates an investment package, you earn Level 1 commissions. As your team grows, you unlock earnings down to Level 5 based on your active Star Designation Rank key.',
  },
  {
    q: 'What should I do if a deposit payment is delayed?',
    a: 'Make sure you submit the exact transaction hash or gateway reference in the Deposit Approval tab. If it takes longer than 30 minutes, submit a ticket below with your deposit ID for immediate verification.',
  },
  {
    q: 'How do I upgrade my Star designation rank?',
    a: 'Star ranks (Star 1 to Star 5) unlock automatically as your total personal active investment and active downline team volume reach designated milestone thresholds.',
  },
  {
    q: 'How does EarnX protect user funds and account data?',
    a: '95% of digital assets are stored in offline multi-signature cold vaults. Communications use 256-bit SSL encryption, and all database state mutations execute inside ACID isolated transactions.',
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      toast.success('Support Ticket Created! Our technical desk will respond to your query shortly.');
      setName('');
      setContactInfo('');
      setCategory('General Inquiry');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 750);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 overflow-x-hidden flex flex-col justify-between">
      <div className="pb-16 space-y-16 sm:space-y-24">
        {/* 1. HERO SECTION (Identical structure & style to Homepage Hero) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/7.5] min-h-[240px] sm:min-h-[380px] lg:min-h-[540px] bg-[#001710] overflow-hidden shadow-2xl"
        >
          <img
            src="/contact-cover.jpg"
            alt="EarnX Capital Help Desk Cover"
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
                  How Can We <br />
                  Help You <br />
                  <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                    Today?
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-slate-200 text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-snug sm:leading-relaxed"
                >
                  24/7 dedicated support desk for deposit verifications, withdrawal speeds, referral trees, and account security.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 pt-0.5 sm:pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a
                      href="#support-form"
                      className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#03442e] hover:bg-[#04593d] text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl flex items-center space-x-1 sm:space-x-2 border border-[#056343] transition-all shadow-xl"
                    >
                      <span>Submit a Ticket</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                    </a>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 2. CONTACT INFO CARDS GRID */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Phone,
                title: 'Direct Phone / WhatsApp',
                value: '+880 1700-000000',
                subtitle: 'Live WhatsApp 24/7',
              },
              {
                icon: Mail,
                title: 'Email Support',
                value: 'support@earnx.com',
                subtitle: 'Avg. Response < 2h',
              },
              {
                icon: MapPin,
                title: 'Head Office',
                value: 'Dhaka, Bangladesh',
                subtitle: 'Official Ops Center',
              },
              {
                icon: Clock,
                title: 'Desk Hours',
                value: 'Monday – Sunday',
                subtitle: 'Non-Stop Monitoring',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={cardItem}
                  whileHover={{ scale: 1.03, y: -6 }}
                  className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-6 text-center space-y-3 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center mx-auto transition-all shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold font-mono text-slate-800">
                    {item.value}
                  </p>
                  <p className="text-[11px] font-bold text-[#03442e]">
                    {item.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 3. SUPPORT FORM & GUIDELINES (2 COLUMNS) */}
        <section id="support-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900">Faster Resolution Tips</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Including exact details in your inquiry helps our support team process your ticket instantly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#023824] border border-[#056343] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">Include Payment Transaction Hash</h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      For deposit verifications, provide your bKash/Nagad/USDT transaction reference ID.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#023824] border border-[#056343] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">Registered Email Address</h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Send tickets using the email connected to your active EarnX account for fast validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#023824] border border-[#056343] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">Level Payout Inquiries</h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Specify the downline member username and referral tree level (L1 to L5).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#001710] border border-[#055c3c] rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-200 shadow-md">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="font-semibold leading-tight text-white">
                  EarnX staff will never ask for your account password or wallet secret keys.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Direct Message Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                <MessageSquare className="w-5 h-5 text-[#03442e]" />
                <h3 className="font-black text-slate-900 text-lg">Send Us a Direct Ticket</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full bg-[#F4F7F6] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#03442e] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Phone or Email</label>
                    <input
                      type="text"
                      required
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Your phone or email..."
                      className="w-full bg-[#F4F7F6] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#03442e] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Inquiry Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#F4F7F6] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#03442e] transition-all cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Deposit Verification">Deposit Verification</option>
                      <option value="Withdrawal Request">Withdrawal Request</option>
                      <option value="Referral & Tree Payouts">Referral & Tree Payouts</option>
                      <option value="Star Rank Upgrade">Star Rank Upgrade</option>
                      <option value="Account & 2FA Security">Account & 2FA Security</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief subject title..."
                      className="w-full bg-[#F4F7F6] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#03442e] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Detailed Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-[#F4F7F6] border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#03442e] transition-all custom-scrollbar"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#03442e] hover:bg-[#04593d] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-[#056343] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{submitting ? 'Submitting Support Ticket...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* 4. INTERACTIVE FAQ ACCORDION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Find quick answers to common queries regarding investments, referrals, and security.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  variants={cardItem}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-[#023322]/50"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between space-x-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#023824] border border-[#056343] text-amber-300 text-xs font-mono flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#03442e] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 5. CTA BANNER (Identical to Homepage CTA) */}
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
                  Need immediate portfolio assistance?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                  Access your active investments, withdrawal history, and downline team tree on your user dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-2 shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl flex items-center space-x-2"
                >
                  <span>Go to User Dashboard</span>
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
