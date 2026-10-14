'use client';

import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import WaysToEarnSection from '../components/landing/WaysToEarnSection';
import LatestProductsSection from '../components/landing/LatestProductsSection';
import MetricsStrip from '../components/landing/MetricsStrip';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AgencyAndInvestmentSection from '../components/landing/AgencyAndInvestmentSection';
import WhyEarnXSection from '../components/landing/WhyEarnXSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import Footer from '../components/Footer';

export default function Homepage() {
  return (
    <div className="bg-[#FBFDFD] text-slate-800 antialiased selection:bg-emerald-500 selection:text-white flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. CORE ECOSYSTEM ARCHITECTURE */}
      <AboutSection />

      {/* 3. TAILORED EARNING PATHWAYS */}
      <WaysToEarnSection />

      {/* 4. OFFICIAL EARNX SHOP / MARKETPLACE */}
      <LatestProductsSection />

      {/* 5. MOBILE BANKING PAYOUTS */}
      <MetricsStrip />

      {/* 6. HOW EARNX CAPITAL WORKS (4-STEP PROGRESSION) */}
      <HowItWorksSection />

      {/* 7. ENTERPRISE AGENCY & STRUCTURED INVESTMENTS */}
      <AgencyAndInvestmentSection />

      {/* 8. DISTINCT VALUE PROPOSITIONS (WHY EARNX) */}
      <WhyEarnXSection />

      {/* 9. FINAL CALL TO ACTION BANNER */}
      <FinalCtaSection />

      {/* 10. SITE FOOTER */}
      <Footer />
    </div>
  );
}
