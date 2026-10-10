'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

export default function SupportTicketForm() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [userCode, setUserCode] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      toast.success('Support Ticket Created! Our technical desk will respond to your query shortly.');
      setName('');
      setContactInfo('');
      setUserCode('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 750);
  };

  return (
    <section id="support-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className="p-6 sm:p-8 specular-rim space-y-6">
          <div className="flex items-center space-x-2.5 border-b border-slate-200/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Open Support Desk Ticket</h3>
              <p className="text-xs text-slate-500 font-medium">Direct inquiry to our 24/7 technical and compliance team</p>
            </div>
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
                  className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
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
                  className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">User ID (Optional)</label>
                <input
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                  placeholder="Enter referral / user ID..."
                  className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief subject title..."
                  className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
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
                className="w-full bg-white/80 border border-slate-200/90 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all custom-scrollbar shadow-xs resize-none"
              />
            </div>

            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full gap-2 shadow-lg shadow-emerald-950/15"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Submitting Support Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-200" />
                    <span>Submit Support Ticket</span>
                  </>
                )}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </section>
  );
}
