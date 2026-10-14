'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12" data-purpose="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link className="flex items-center gap-2 group" href="/">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                earn<span className="text-emerald-600">x</span>{' '}
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Capital</span>
              </span>
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">
              EarnX Capital is a modern digital platform unifying verified marketplace merchandise, performance marketing, team entrepreneurship, and structured investments.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                className="hover:text-emerald-600 transition-colors"
                href="#"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                className="hover:text-emerald-600 transition-colors"
                href="#"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
              <a
                className="hover:text-emerald-600 transition-colors"
                href="#"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/about">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/contact">
                  Press &amp; Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Marketplace */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/products">
                  All Products
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/products">
                  Categories
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/dashboard/purchase">
                  VIP Packages
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/dashboard">
                  Merchant Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Opportunities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Opportunities</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/register">
                  Sales &amp; Marketing
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/register">
                  Team-Based Business
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/investments">
                  Investments
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className="hover:text-emerald-600 transition-colors" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EarnX Capital. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
            <Link className="hover:underline hover:text-slate-700" href="/terms">
              Security Audit
            </Link>
            <Link className="hover:underline hover:text-slate-700" href="/privacy">
              Legal Framework
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
