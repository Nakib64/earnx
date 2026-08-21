'use client';

import React from 'react';
import HeroBanner from '../../components/public/HeroBanner';
import ContactInfoGrid from '../../components/public/ContactInfoGrid';
import SupportTicketForm from '../../components/public/SupportTicketForm';
import FaqAccordion from '../../components/public/FaqAccordion';
import CtaBanner from '../../components/public/CtaBanner';
import Footer from '../../components/Footer';

const contactFaqs = [
  {
    question: 'How fast are withdrawal requests processed?',
    answer:
      'Withdrawals are monitored by our automated financial ledger. Automated payouts for verified accounts process instantly or within 15–30 minutes depending on network congestion.',
  },
  {
    question: 'How do 5-level referral commissions work?',
    answer:
      'When your direct invite activates an investment package, you earn Level 1 commissions. As your team grows, you unlock earnings down to Level 5 based on your active Star Designation Rank key.',
  },
  {
    question: 'What should I do if a deposit payment is delayed?',
    answer:
      'Make sure you submit the exact transaction hash or gateway reference in the Deposit Approval tab. If it takes longer than 30 minutes, submit a ticket below with your deposit ID for immediate verification.',
  },
  {
    question: 'How do I upgrade my Star designation rank?',
    answer:
      'Star ranks (Star 1 to Star 5) unlock automatically as your total personal active investment and active downline team volume reach designated milestone thresholds.',
  },
  {
    question: 'How does EarnX protect user funds and account data?',
    answer:
      '95% of digital assets are stored in offline multi-signature cold vaults. Communications use 256-bit SSL encryption, and all database state mutations execute inside ACID isolated transactions.',
  },
];

export default function ContactPage() {
  return (
    <div className="bg-[#F4F7F6] text-slate-900 flex flex-col justify-between">
      <div className="pb-16 space-y-16 sm:space-y-24">
        {/* 1. Hero Banner Component */}
        <HeroBanner
          bgImage="/contact-cover.jpg"
          title={
            <>
              How Can We <br />
              Help You <br />
              <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                Today?
              </span>
            </>
          }
          description="24/7 dedicated support desk for deposit verifications, withdrawal speeds, referral trees, and account security."
          primaryBtnText="Submit a Ticket"
          primaryBtnHref="#support-form"
        />

        {/* 2. Contact Info Grid Component */}
        <ContactInfoGrid />

        {/* 3. Support Ticket Form Component */}
        <SupportTicketForm />


     
      </div>

      {/* Smart Footer Component */}
      <Footer />
    </div>
  );
}
