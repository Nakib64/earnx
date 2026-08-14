'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Sparkles, Headset, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      toast.success('Thank you! Your message has been submitted. Our support team will get back to you shortly.');
      setName('');
      setContactInfo('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="bg-[#090d16] text-white min-h-screen space-y-12 pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-[#d4af37]/40 text-amber-200 px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
          <Sparkles className="w-4 h-4 text-[#f3ba2f]" />
          <span>24/7 Dedicated Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Contact EarnX Support Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-semibold">
          Have questions about your wallet balance, referral commissions, or investment packages? Get in touch with us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 flex items-start space-x-4">
            <div className="p-3 bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">Phone / WhatsApp</h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5">+880 1700-000000</p>
              <span className="text-[10px] font-extrabold text-[#10b981]">Available 24/7</span>
            </div>
          </div>

          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 flex items-start space-x-4">
            <div className="p-3 bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] rounded-xl shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">Email Support</h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5">support@earnx.com</p>
              <span className="text-[10px] font-extrabold text-amber-300">Response within 2 hours</span>
            </div>
          </div>

          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 flex items-start space-x-4">
            <div className="p-3 bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">Head Office</h4>
              <p className="text-xs text-slate-300 mt-0.5">Dhaka, Bangladesh</p>
              <span className="text-[10px] font-extrabold text-amber-200">Official Operations Center</span>
            </div>
          </div>

          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 flex items-start space-x-4">
            <div className="p-3 bg-slate-800/80 border border-[#d4af37]/40 text-[#f3ba2f] rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">Working Hours</h4>
              <p className="text-xs text-slate-300 mt-0.5">Monday – Sunday (Always Open)</p>
              <span className="text-[10px] font-extrabold text-[#10b981]">Continuous Payout Monitoring</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gradient-to-br from-[#141a29] via-[#101522] to-[#0c0f1a] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <MessageSquare className="w-5 h-5 text-[#f3ba2f]" />
            <h3 className="font-black text-white text-base">Send Us a Direct Message</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-200 uppercase tracking-wider">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-200 uppercase tracking-wider">Phone / Email</label>
                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Your phone number or email..."
                  className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-200 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this regarding?"
                className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-200 uppercase tracking-wider">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                className="w-full bg-[#161c2b] border border-slate-700 rounded-xl p-4 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37] custom-scrollbar"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{submitting ? 'Sending Message...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
