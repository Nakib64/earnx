'use client';

import React from 'react';
import HeroBanner from '../../components/public/HeroBanner';
import FeatureCards from '../../components/public/FeatureCards';
import FaqAccordion from '../../components/public/FaqAccordion';
import SecurityProtocolCard from '../../components/public/SecurityProtocolCard';
import CtaBanner from '../../components/public/CtaBanner';
import Footer from '../../components/Footer';
import { Target, ShieldCheck, Cpu, Layers } from 'lucide-react';

const aboutFeatures = [
  {
    icon: Target,
    title: 'Mission & Vision',
    desc: 'Empowering global users with high-yield, transparent, and verified financial infrastructure.',
  },
  {
    icon: ShieldCheck,
    title: 'Cold Storage Vaults',
    desc: '95% of digital assets stored in multi-signature offline cold storage for absolute safety.',
  },
  {
    icon: Cpu,
    title: 'Automated Settlements',
    desc: 'Smart contract engine ensuring automated instant deposits and payout executions.',
  },
  {
    icon: Layers,
    title: 'ACID Ledger Accounting',
    desc: 'Real-time double-entry transaction database ensuring zero-discrepancy audit compliance.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#F4F7F6] text-slate-900 flex flex-col justify-between">
      <div className="pb-16 space-y-16 sm:space-y-24">
        {/* 1. Hero Banner Component */}
        <HeroBanner
          bgImage="/about-cover.jpg"
          title={
            <>
              Pioneering <br />
              Digital Finance <br />
              <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                Ecosystem
              </span>
            </>
          }
          description="Enterprise-grade digital asset platform engineered with ACID transaction accounting and 95% multi-sig cold vault security."
          primaryBtnText="Get Started"
        />

        {/* 2. Feature Cards Component */}
        <FeatureCards items={aboutFeatures} />

   

        {/* 4. Security Protocol Card Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SecurityProtocolCard />
        </div>

        {/* 5. CTA Banner Component */}
        <CtaBanner
          title="Need immediate portfolio assistance?"
          description="Access your active investments, withdrawal history, and downline team tree on your user dashboard."
          buttonText="Go to User Dashboard"
        />
      </div>

      {/* Smart Footer Component */}
      <Footer />
    </div>
  );
}
