'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import Footer from '../../components/Footer';

const contactCards = [
  {
    icon: Phone,
    title: 'Direct WhatsApp Desk',
    value: '+880 1700-000000',
    subtitle: 'Live WhatsApp 24/7 Support Agent',
    badge: 'INSTANT CHAT',
    href: 'https://wa.me/8801700000000',
  },
  {
    icon: Mail,
    title: 'Official Email Desk',
    value: 'support@earnx.com',
    subtitle: 'Avg. Response Time < 2 Hours',
    badge: 'RAPID INBOX',
    href: 'mailto:support@earnx.com',
  },
  {
    icon: Clock,
    title: 'Operations & Audits',
    value: 'Monday – Sunday',
    subtitle: 'Continuous 24/7 Automated Pipeline',
    badge: 'ALWAYS OPEN',
    href: '#support-form',
  },
];

const faqs = [
  {
    question: 'How fast are withdrawal requests processed?',
    answer:
      'Withdrawals are monitored by our automated financial pipeline. Automated payouts for verified mobile wallets (bKash, Nagad, upay) process within 15–30 minutes directly into your account.',
  },
  {
    question: 'How do multi-tier team referral commissions work?',
    answer:
      'When your direct invite activates a VIP package or completes purchases, you earn direct Level 1 commissions. As your team grows, you unlock team overrides down to Level 5 based on your active Star designation rank.',
  },
  {
    question: 'What should I do if a deposit payment is delayed?',
    answer:
      'Make sure you submit the exact transaction ID (TrxID) or gateway reference in the Deposit tab. If it takes longer than 30 minutes, submit a ticket below with your TrxID for immediate priority verification.',
  },
  {
    question: 'How do I upgrade my Star designation rank?',
    answer:
      'Star ranks (Star 1 through Star 5) unlock automatically as your total personal active balance and accumulated downline team volume hit designated milestones.',
  },
  {
    question: 'How does EarnX protect user funds and account data?',
    answer:
      'Over 95% of digital assets are protected in multi-signature cold vaults. All user communications use 256-bit SSL encryption, and every balance mutation executes inside isolated ACID transactions.',
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [userCode, setUserCode] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      toast.success('Support Ticket Created! Our technical desk will respond to your inquiry shortly.');
      setName('');
      setContactInfo('');
      setUserCode('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 750);
  };

  return (
    <div className="bg-[#FBFDFD] text-slate-800 antialiased selection:bg-emerald-500 selection:text-white flex flex-col min-h-screen">
      {/* 1. HERO HEADER */}
      <section className="relative pt-12 pb-16 overflow-hidden grid-bg-pattern border-b border-slate-200/60" data-purpose="contact-hero">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>24/7 DEDICATED CUSTOMER CARE &amp; DESK</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-4xl mx-auto space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              CONTACT &amp; SUPPORT<span className="text-emerald-600">.</span>
            </h1>

            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-slate-800">We&apos;re Here. </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500">
                How Can We Help You Today?
              </span>
            </p>

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed pt-2">
              Have questions about your wallet balance, withdrawals, affiliate overrides, or enterprise investments? Connect with our dedicated support desk anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. DIRECT CONTACT CARDS ROW */}
      <section className="py-16 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.title}
                  href={item.href}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 text-center flex flex-col items-center justify-between group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-lg font-extrabold text-emerald-600 mb-2 font-mono">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. TICKET FORM & FAQS DUAL GRID */}
      <section id="support-form" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Open Support Desk Ticket
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct inquiry to our 24/7 technical and compliance team
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contact Phone or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="e.g. +880 17... or email"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Account / Referral ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="e.g. EX-89241"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Department / Topic
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                    >
                      <option value="">Select Department...</option>
                      <option value="Deposit & Trx Verification">Deposit &amp; Trx Verification</option>
                      <option value="Withdrawal Processing">Withdrawal Processing</option>
                      <option value="Marketplace Order Assistance">Marketplace Order Assistance</option>
                      <option value="VIP Package Activation">VIP Package Activation</option>
                      <option value="Team Commission Overrides">Team Commission Overrides</option>
                      <option value="Security / General Query">Security / General Query</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Inquiry Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail. Include any relevant TrxID or invoice numbers..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Support Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* FAQs Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>KNOWLEDGE BASE</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">
                  Quick answers to standard questions about finances, packages, and security.
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left font-bold text-sm text-slate-800 flex items-center justify-between gap-4 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-emerald-600' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
}
