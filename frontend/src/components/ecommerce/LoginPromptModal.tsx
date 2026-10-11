'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, X, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const LoginPromptModal: React.FC = () => {
  const { isLoginPromptOpen, setIsLoginPromptOpen, loginPromptMessage } = useCart();
  const router = useRouter();

  if (!isLoginPromptOpen) return null;

  const handleLogin = () => {
    setIsLoginPromptOpen(false);
    router.push('/login');
  };

  const handleRegister = () => {
    setIsLoginPromptOpen(false);
    router.push('/register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in font-[family-name:var(--font-montserrat)]">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white border border-white/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.15)] space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsLoginPromptOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#009F6B] shadow-[4px_4px_12px_rgba(0,159,107,0.15),-4px_-4px_12px_rgba(255,255,255,0.9)]">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Account Login Required
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              {loginPromptMessage}
            </p>
          </div>
        </div>

        {/* Benefits reminder */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-slate-800">Why login to purchase?</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500">
            <li>Instant 1-click payment directly through your EarnX wallet balance</li>
            <li>Track your parcel shipping &amp; delivery status live</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white text-sm font-bold shadow-[4px_4px_14px_rgba(0,159,107,0.3)] transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to Your Account</span>
          </button>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create a Free Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
