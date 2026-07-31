'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Wallet, User as UserIcon, LogOut, Menu, X, Gift, CheckCircle, Clock } from 'lucide-react';

export default function Navbar() {
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAdminRoute ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl sky-gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              X
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
                EarnX
              </span>
              <span className="text-[10px] font-semibold text-slate-400 -mt-1 uppercase tracking-widest">
                {isAdminRoute ? 'Admin Portal' : 'MLM Ecosystem'}
              </span>
            </div>
          </Link>

          {/* Right Status & Profile Controls */}
          <div className="flex items-center space-x-3">
            {user && !isAdminRoute && (
              <div className="flex items-center space-x-2">
                {/* Balance Badge */}
                <div className="bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-full flex items-center space-x-1.5">
                  <Wallet className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-sky-900">
                    ${Number(user.wallet_balance).toFixed(2)}
                  </span>
                </div>

                {/* Account Status Badge */}
                {user.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Disabled
                  </span>
                )}

                {/* Logout User */}
                <button
                  onClick={logoutUser}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {admin && isAdminRoute && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                  Admin: {admin.email}
                </span>
                <button
                  onClick={logoutAdmin}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
