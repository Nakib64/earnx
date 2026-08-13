'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  const { user, admin } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* Animated 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#005A36]/5 animate-ping" style={{ animationDuration: '2.5s' }} />
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-[#005A36]/10 to-[#D4AF37]/10 border-2 border-[#005A36]/15">
            <ShieldAlert className="w-14 h-14 text-[#005A36]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-r from-[#005A36] via-[#D4AF37] to-[#005A36] bg-clip-text text-transparent select-none">
            404
          </h1>
          <div className="mt-2 h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-[#005A36] to-[#D4AF37]" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" />
            <span>Back to Home</span>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-[#005A36]/20 text-[#005A36] font-extrabold text-sm rounded-xl hover:bg-[#005A36]/5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
              <span>Go to Dashboard</span>
            </Link>
          ) : admin ? (
            <Link
              href="/admin/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-[#005A36]/20 text-[#005A36] font-extrabold text-sm rounded-xl hover:bg-[#005A36]/5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
              <span>Admin Panel</span>
            </Link>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-extrabold text-sm rounded-xl hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>

        {/* Decorative Dots */}
        <div className="flex items-center justify-center space-x-1.5 pt-4">
          <span className="w-2 h-2 rounded-full bg-[#005A36]" />
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span className="w-2 h-2 rounded-full bg-[#005A36]/30" />
        </div>
      </div>
    </div>
  );
}
