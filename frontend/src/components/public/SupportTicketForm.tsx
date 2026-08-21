'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Right Column: Direct Message Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <MessageSquare className="w-5 h-5 text-[#03442e]" />
            <h3 className="font-black text-slate-900 text-lg">Contact Us</h3>
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
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">User Id</label>
                <input
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                  placeholder="Enter user id..."
                  className="w-full bg-[#F4F7F6] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-[#03442e] transition-all"
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
  );
}
