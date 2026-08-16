'use client';

import React from 'react';
import HeroBanner from '../components/public/HeroBanner';
import CryptoTickerCard from '../components/public/CryptoTickerCard';
import FeatureCards from '../components/public/FeatureCards';
import HowItWorks from '../components/public/HowItWorks';
import CtaBanner from '../components/public/CtaBanner';
import Footer from '../components/Footer';

export default function Homepage() {
  return (
    <div className="bg-[#F4F7F6] text-slate-900 flex flex-col justify-between">
      <div className="pb-16">
        {/* 1. Hero Banner Component */}
        <HeroBanner
          bgImage="/hero-banner.jpg"
          title={
            <>
              Grow Your <br />
              Wealth With <br />
              <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                EarnX
              </span>
            </>
          }
          description="Smart digital asset management with a premium experience."
          secondaryBtnText="EarnX Coin"
          secondaryBtnHref="/dashboard/coins"
          showMemberStats={true}
        />

        {/* Lower Sections */}
        <div className="space-y-14 sm:space-y-20 pt-10 sm:pt-14">
          {/* 2. Crypto Market Ticker Component */}
          <CryptoTickerCard />

          {/* 3. Feature Cards Component */}
          <FeatureCards />

          {/* 4. How It Works Component */}
          <HowItWorks />

          {/* 5. CTA Banner Component */}
          <CtaBanner />
        </div>
      </div>

      {/* Smart Footer Component */}
      <Footer />
    </div>
  );
}
