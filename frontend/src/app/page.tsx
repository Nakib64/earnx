'use client';

import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import WaysToEarnSection from '../components/landing/WaysToEarnSection';
import MetricsStrip from '../components/landing/MetricsStrip';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AgencyAndInvestmentSection from '../components/landing/AgencyAndInvestmentSection';
import MarketplaceSection from '../components/landing/MarketplaceSection';
import TeamBusinessSection from '../components/landing/TeamBusinessSection';
import WhyEarnXSection from '../components/landing/WhyEarnXSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import Footer from '../components/Footer';

export default function Homepage() {
  return (
    <div className="bg-white text-slate-900 flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. WHAT IS EARNX CAPITAL? */}
      <AboutSection />

      {/* 3. MULTIPLE WAYS TO EARN (3 Tinted Cards) */}
      <WaysToEarnSection />

      {/* 4. METRICS / STATS STRIP */}
      <MetricsStrip />

      {/* 5. HOW EARNX CAPITAL WORKS? (4 Horizontal Connected Steps) */}
      <HowItWorksSection />

      {/* 6. AGENCY SERVICES & INVESTMENT SPLIT SECTION */}
      <AgencyAndInvestmentSection />

      {/* 7. MARKETPLACE (Shop & Sell Ecosystem) */}
      <MarketplaceSection />

      {/* 8. TEAM BUSINESS (Collaborative Leadership) */}
      <TeamBusinessSection />

      {/* 9. WHY CHOOSE EARNX? (5 Value Proposition Cards) */}
      <WhyEarnXSection />

      {/* 10. FINAL CTA (Dark Green Banner with Gold Action) */}
      <FinalCtaSection />

      {/* 11. CLEAN WHITE FOOTER */}
      <Footer />
    </div>
  );
}
