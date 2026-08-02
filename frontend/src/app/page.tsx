'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Wallet,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Star,
  Trophy,
  BadgeDollarSign,
  Landmark,
  RefreshCw,
  Phone,
  UserPlus,
  CircleDollarSign,
  Share2,
  Gift,
  Layers,
} from 'lucide-react';

// ─── Data ───────────────────────────────────────────────────────────────────

const PARTNER_LOGOS = [
  { name: 'bKash', color: '#E2136E' },
  { name: 'Nagad', color: '#F4A216' },
  { name: 'Rocket', color: '#8B2BE2' },
  { name: 'Dutch-Bangla', color: '#DA2128' },
  { name: 'Upay', color: '#0B74C5' },
  { name: 'SureCash', color: '#009345' },
  { name: 'MYCash', color: '#E61E25' },
  { name: 'TeleCash', color: '#1A56DB' },
];

const STATS = [
  { label: 'Active Members', value: 12480, suffix: '+', icon: Users },
  { label: 'Total Paid Out', value: 4.8, suffix: 'M ৳', prefix: '', decimals: 1, icon: BadgeDollarSign },
  { label: 'Avg. Monthly Return', value: 15, suffix: '%', icon: TrendingUp },
  { label: 'Commission Levels', value: 5, suffix: '', icon: Layers },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Register with Referral Code',
    desc: "Sign up with your mobile number and your sponsor's referral code. Takes less than 2 minutes.",
    color: 'from-sky-400 to-blue-600',
    glow: 'rgba(56,189,248,0.35)',
  },
  {
    step: '02',
    icon: CheckCircle2,
    title: 'Get Account Activated',
    desc: 'Your direct referrer or admin approves your activation request. Your account goes live instantly.',
    color: 'from-violet-400 to-purple-600',
    glow: 'rgba(167,139,250,0.35)',
  },
  {
    step: '03',
    icon: Share2,
    title: 'Build Your Network',
    desc: 'Share your unique referral link. Every person who joins under you strengthens your earning tree.',
    color: 'from-emerald-400 to-green-600',
    glow: 'rgba(52,211,153,0.35)',
  },
  {
    step: '04',
    icon: CircleDollarSign,
    title: 'Earn Multi-Level Commissions',
    desc: 'Earn instant commissions up to 5 levels deep every time someone in your downline activates or upgrades.',
    color: 'from-amber-400 to-orange-500',
    glow: 'rgba(251,191,36,0.35)',
  },
];

const EARNING_PLANS = [
  {
    name: 'Activation Plan',
    badge: 'Free to Join',
    icon: Zap,
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    features: [
      'Earn ৳100 per direct referral',
      'Up to 5 levels of commission',
      'Instant wallet credit',
      'Lifetime referral earnings',
    ],
    highlight: false,
  },
  {
    name: 'Premium Plan',
    badge: 'Most Popular',
    icon: Award,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-700',
    features: [
      'Weekly passive payouts',
      'Earn ৳500 per Premium referral',
      'Up to 5 levels commission',
      '52-week payout cycle',
    ],
    highlight: true,
  },
  {
    name: 'Investment Plan',
    badge: 'Max Returns',
    icon: TrendingUp,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-700',
    features: [
      'Up to 15% monthly returns',
      'Monthly automatic payout',
      '12-month investment cycle',
      'Flexible plan amounts',
    ],
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Rahim Chowdhury',
    location: 'Dhaka',
    amount: '৳12,500',
    period: 'this month',
    text: 'EarnX changed my life. I refer 3 people, they each refer 3, and the commissions just keep flowing. The payment is always instant.',
    stars: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahim&backgroundColor=b6e3f4',
  },
  {
    name: 'Nusrat Jahan',
    location: 'Chittagong',
    amount: '৳8,200',
    period: 'last month',
    text: 'I was skeptical at first but the transparent ledger system convinced me. Every taka is accounted for. Highly recommend to anyone.',
    stars: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat&backgroundColor=ffd5dc',
  },
  {
    name: 'Tanvir Ahmed',
    location: 'Sylhet',
    amount: '৳19,800',
    period: 'this month',
    text: 'The multi-level commission is real. I am now earning from 5 generations under me. This is the best earning platform in Bangladesh.',
    stars: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanvir&backgroundColor=c0aede',
  },
  {
    name: 'Sabrina Islam',
    location: 'Rajshahi',
    amount: '৳6,750',
    period: 'this month',
    text: 'bKash withdrawal every week. No delay, no excuses. EarnX is completely trustworthy and the support is always helpful.',
    stars: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sabrina&backgroundColor=ffdfbf',
  },
  {
    name: 'Mahmudul Hasan',
    location: 'Comilla',
    amount: '৳22,300',
    period: 'this month',
    text: 'Premium plan gave me weekly income. Combine that with referral commissions and I am earning more than my full time job.',
    stars: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mahmud&backgroundColor=d1f4d9',
  },
];

const FAQ = [
  {
    q: 'How do I get started on EarnX?',
    a: 'Simply register with your phone number and a referral code from an existing member. Your account gets activated by your sponsor or admin, then you can start earning immediately.',
  },
  {
    q: 'How does the multi-level commission work?',
    a: 'When someone in your downline activates or upgrades to Premium, you earn a commission based on your level from them — up to 5 levels deep. The deeper your network, the more you earn passively.',
  },
  {
    q: 'When do I get paid?',
    a: 'Commissions are credited to your wallet instantly the moment a downline member activates. Premium weekly payouts are credited every 7 days. You can withdraw to bKash, Nagad, or Rocket anytime.',
  },
  {
    q: 'Is EarnX safe and transparent?',
    a: 'Yes. EarnX uses an ACID-compliant transaction ledger where every deposit, payout, and withdrawal is permanently recorded. You can view your full transaction history in your dashboard at any time.',
  },
  {
    q: 'What is the Investment Plan?',
    a: 'The Investment Plan lets you invest a fixed amount and earn up to 15% monthly returns automatically paid to your wallet over 12 months.',
  },
];

const TOP_EARNERS = [
  { rank: 1, name: 'Shakib Al Hasan', amount: '৳1,25,000', badge: 'VIP Diamond', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4' },
  { rank: 2, name: 'Rahim Chowdhury', amount: '৳98,500', badge: 'Top Investor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=ffd5dc' },
  { rank: 3, name: 'Nusrat Jahan', amount: '৳87,200', badge: 'Gold Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=c0aede' },
  { rank: 4, name: 'Tanvir Ahmed', amount: '৳72,800', badge: 'Top 10 Club', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=d1f4d9' },
  { rank: 5, name: 'Sabrina Islam', amount: '৳65,400', badge: 'Top 10 Club', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5&backgroundColor=ffdfbf' },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, decimals = 0, duration = 1800 }: { target: number; decimals?: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setCount(parseFloat((eased * target).toFixed(decimals)));
            if (elapsed < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return <span ref={ref}>{count.toFixed(decimals)}</span>;
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3 bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800 leading-snug">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-sky-500 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
          {a}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, admin } = useAuth();
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lp-root -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 overflow-x-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] flex flex-col justify-center px-5 pt-16 pb-20 hero-bg">
        {/* Background blobs */}
        <div className="absolute top-[-80px] right-[-60px] w-72 h-72 bg-sky-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-40px] w-64 h-64 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating badge */}
        <div className="relative z-10 inline-flex items-center self-start gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/25 text-white mb-5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Bangladesh's #1 Earning Network</span>
        </div>

        <div className="relative z-10 space-y-5 max-w-lg">
          <h1 className="text-[2.6rem] leading-[1.1] font-black tracking-tight text-white">
            Empower Your Network.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
              Earn Without Limits.
            </span>
          </h1>

          <p className="text-sky-100 text-sm leading-relaxed">
            Join <strong className="text-white">12,000+ active members</strong> earning daily commissions through our transparent 5-level referral system. Withdraw to bKash, Nagad, or Rocket instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <Link href="/dashboard" className="hero-cta-primary flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : admin ? (
              <Link href="/admin/dashboard" className="hero-cta-primary flex items-center justify-center gap-2">
                Admin Portal <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/register" id="hero-register-btn" className="hero-cta-primary flex items-center justify-center gap-2 group">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/login" className="hero-cta-secondary flex items-center justify-center gap-2">
                  Member Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {['Instant Withdrawal', 'bKash & Nagad', 'Secure & Trusted'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-sky-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Floating earning card */}
        <div className="relative z-10 mt-8 floating-card bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs text-sky-200">Last Payout</p>
              <p className="text-white font-bold text-base">৳2,500 credited</p>
            </div>
            <div className="ml-auto bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-full">LIVE</div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ────────────────────────────────────────────────────── */}
      <section className="stats-bar px-5 py-8 grid grid-cols-2 gap-4">
        {STATS.map(({ label, value, suffix, prefix, decimals = 0, icon: Icon }) => (
          <div key={label} className="stats-card text-center p-4 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4.5 h-4.5 text-sky-600" style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-xl font-black text-slate-900">
              {prefix}
              <AnimatedCounter target={value} decimals={decimals} />
              {suffix}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </section>

      {/* ── 3. PARTNERS / TRUSTED BY ────────────────────────────────────────── */}
      <section className="py-8 px-5">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Trusted Payment Partners
        </p>
        <div className="ticker-wrapper overflow-hidden">
          <div className="ticker-track flex gap-6 items-center">
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((p, i) => (
              <div
                key={i}
                className="ticker-item flex-shrink-0 h-11 px-5 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-sm shadow-sm whitespace-nowrap"
                style={{ color: p.color, minWidth: 110 }}
              >
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-10 px-5 space-y-6 bg-slate-50">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Simple Steps</span>
          <h2 className="text-2xl font-black text-slate-900">How EarnX Works</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Start earning in 4 simple steps. No experience required.</p>
        </div>

        <div className="space-y-4">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, glow }, idx) => (
            <div key={step} className="how-card bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                style={{ boxShadow: `0 6px 20px ${glow}` }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest">STEP {step}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="absolute left-[2.35rem] mt-[4.5rem] w-px h-4 bg-slate-200 hidden" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. EARNING PLANS ────────────────────────────────────────────────── */}
      <section className="py-10 px-5 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Income Streams</span>
          <h2 className="text-2xl font-black text-slate-900">Multiple Ways to Earn</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Choose your path to financial freedom.</p>
        </div>

        <div className="space-y-4">
          {EARNING_PLANS.map(({ name, badge, icon: Icon, gradient, features, highlight }) => (
            <div
              key={name}
              className={`plan-card rounded-2xl overflow-hidden border ${highlight ? 'border-violet-400 shadow-lg shadow-violet-200' : 'border-slate-200'}`}
            >
              <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="text-white font-bold text-base">{name}</h3>
                </div>
                <span className="text-[10px] font-black bg-white/25 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {badge}
                </span>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-slate-700">{f}</span>
                  </div>
                ))}
                {!user && !admin && (
                  <Link
                    href="/register"
                    className={`mt-3 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r ${gradient} text-white shadow-md`}
                  >
                    Join Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-10 px-5 space-y-6 bg-slate-50">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Real Stories</span>
          <h2 className="text-2xl font-black text-slate-900">What Our Members Say</h2>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="min-w-full">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full bg-slate-100" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-400">{t.location} · Earned <strong className="text-emerald-600">{t.amount}</strong> {t.period}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-6 h-2 bg-sky-500' : 'w-2 h-2 bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TOP EARNERS LEADERBOARD PREVIEW ───────────────────────────────── */}
      <section className="py-10 px-5 space-y-5">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Leaderboard</span>
          <h2 className="text-2xl font-black text-slate-900">Top Earners This Month</h2>
          <p className="text-xs text-slate-500">See who's leading the pack on EarnX.</p>
        </div>

        <div className="space-y-3">
          {TOP_EARNERS.map(({ rank, name, amount, badge, avatar }) => (
            <div key={rank} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0
                ${rank === 1 ? 'bg-amber-400 text-white' : rank === 2 ? 'bg-slate-300 text-slate-700' : rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
              </div>
              <img src={avatar} alt={name} className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                <p className="text-[11px] text-slate-400">{badge}</p>
              </div>
              <p className="text-sm font-black text-emerald-600 flex-shrink-0">{amount}</p>
            </div>
          ))}
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-sky-200 text-sky-600 text-sm font-bold hover:bg-sky-50 transition-colors">
          View Full Leaderboard <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── 8. WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <section className="py-10 px-5 space-y-5 bg-slate-50">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Why EarnX</span>
          <h2 className="text-2xl font-black text-slate-900">Built for Trust & Transparency</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ShieldCheck, title: 'Secure Ledger', desc: 'ACID-compliant transaction records. Zero balance drift.', color: 'bg-sky-100 text-sky-600' },
            { icon: Zap, title: 'Instant Payouts', desc: "Commissions hit your wallet the second they're earned.", color: 'bg-amber-100 text-amber-600' },
            { icon: RefreshCw, title: 'Auto Payouts', desc: 'Premium & investment payouts run automatically weekly.', color: 'bg-violet-100 text-violet-600' },
            { icon: Phone, title: 'Mobile First', desc: 'Designed for your phone. Works perfectly on any device.', color: 'bg-emerald-100 text-emerald-600' },
            { icon: Layers, title: '5-Level Deep', desc: 'Earn commissions from 5 generations of your downline.', color: 'bg-rose-100 text-rose-600' },
            { icon: Gift, title: 'Bonus Plans', desc: 'Special star designations unlock deeper commission levels.', color: 'bg-orange-100 text-orange-600' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon style={{ width: 17, height: 17 }} />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">{title}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-10 px-5 space-y-5">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Got Questions?</span>
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked</h2>
        </div>

        <div className="space-y-2.5">
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── 10. FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="mx-5 mb-8 rounded-3xl cta-gradient overflow-hidden relative">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        <div className="relative z-10 px-6 py-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Join 12,000+ Members Today
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Start Earning Today.<br />Zero Investment Needed.
          </h2>
          <p className="text-sky-100 text-xs leading-relaxed max-w-xs mx-auto">
            Create your free account, get activated, and earn your first commission within hours.
          </p>
          {!user && !admin && (
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/register" id="cta-register-btn" className="bg-white text-sky-600 font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-sky-50 transition-colors group">
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="border border-white/30 text-white font-semibold py-3 rounded-2xl text-sm flex items-center justify-center hover:bg-white/10 transition-colors">
                Already a member? Sign In
              </Link>
            </div>
          )}
          {user && (
            <Link href="/dashboard" className="bg-white text-sky-600 font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
