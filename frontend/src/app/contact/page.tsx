'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Sparkles } from 'lucide-react';
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
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>We are here to help</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact EarnX Support Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions about your wallet balance, referral commissions, or account status? Get in touch with us 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Phone / WhatsApp</h4>
              <p className="text-xs text-slate-500 mt-0.5">+880 1700-000000</p>
              <span className="text-[10px] font-semibold text-emerald-600">Available 24/7</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Email Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">support@earnx.com</p>
              <span className="text-[10px] font-semibold text-purple-600">Response within 2 hours</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Head Office</h4>
              <p className="text-xs text-slate-500 mt-0.5">Dhaka, Bangladesh</p>
              <span className="text-[10px] font-semibold text-amber-600">Official Operations Center</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Working Hours</h4>
              <p className="text-xs text-slate-500 mt-0.5">Monday – Sunday (Always Open)</p>
              <span className="text-[10px] font-semibold text-emerald-600">Continuous Payout Monitoring</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-xl lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">Send Us a Direct Message</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nakib Hasan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01700000000 or email@example.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Referral Commission Inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message Details
              </label>
              <textarea
                required
                rows={4}
                placeholder="Write your query or details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl sky-gradient-btn font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
