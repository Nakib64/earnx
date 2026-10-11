'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Wallet,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiFetch } from '../../lib/api';

const BD_DISTRICTS = [
  'Dhaka',
  'Chittagong',
  'Gazipur',
  'Narayanganj',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Bogura',
  'Cox\'s Bazar',
  'Jessore',
  'Dinajpur',
  'Brahmanbaria',
  'Tangail',
  'Feni',
  'Noakhali',
  'Pabna',
  'Kushtia',
  'Faridpur',
  'Other District',
];

export default function CheckoutPage() {
  const { user, isLoading: authLoading, refreshUserProfile } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [city, setCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Processing state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Pre-fill user data when available
  useEffect(() => {
    if (user) {
      if (user.full_name) setCustomerName(user.full_name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Auth protection: redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-[family-name:var(--font-montserrat)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#009F6B] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading checkout session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // If order was successfully placed
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 font-[family-name:var(--font-montserrat)] flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl bg-white border border-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#009F6B] mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#009F6B]">
              Payment Successful
            </span>
            <h1 className="text-2xl font-black text-slate-900">Order Confirmed!</h1>
            <p className="text-xs text-slate-500 font-medium">
              Your order has been paid in full via your EarnX wallet balance and received by our fulfillment center.
            </p>
          </div>

          {/* Receipt Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID:</span>
              <strong className="text-slate-900">{orderSuccess.order_number}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Paid:</span>
              <strong className="text-[#009F6B] text-sm">৳{Number(orderSuccess.total_amount).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient:</span>
              <span className="text-slate-800 font-medium">{orderSuccess.customer_name} ({orderSuccess.customer_phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Delivery To:</span>
              <span className="text-slate-800 font-medium">{orderSuccess.district}, {orderSuccess.delivery_address}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/dashboard/orders"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all"
            >
              <span>View My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/products"
              className="w-full inline-block py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-[family-name:var(--font-montserrat)]">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          You don't have any items in your checkout session. Browse our collection of verified products to add items.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-xs transition-all"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const walletBalance = Number(user.wallet_balance || 0);
  const isBalanceSufficient = walletBalance >= cartTotal;
  const balanceDifference = Math.max(0, cartTotal - walletBalance);
  const remainingBalanceAfter = Math.max(0, walletBalance - cartTotal);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMsg('Please complete all required fields (Name, Phone number, and Delivery address).');
      return;
    }

    if (!isBalanceSufficient) {
      setErrorMsg(`Insufficient wallet balance. You need ৳${balanceDifference.toFixed(2)} more in your wallet.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiFetch<any>('/ecommerce/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          district,
          city: city.trim() || undefined,
          delivery_address: deliveryAddress.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      if (res.success && res.data) {
        clearCart();
        setOrderSuccess(res.data);
        await refreshUserProfile();
      } else {
        setErrorMsg(res.error?.message || 'Failed to process checkout. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-[family-name:var(--font-montserrat)] py-8 sm:py-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
          <span className="text-xs text-slate-400 font-medium">
            Checkout • Secure Wallet Escrow
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Secure Order Checkout
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Complete your delivery information. Payment is processed instantly via your EarnX wallet.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-xs text-red-800 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bangladeshi Shipping Form (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[6px_6px_20px_rgba(15,23,42,0.03)] space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B]">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                1. Delivery &amp; Shipping Address
              </h2>
            </div>

            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Recipient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B] focus:border-transparent transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Contact Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B] focus:border-transparent transition-all"
                />
                <span className="text-[11px] text-slate-400 font-medium">
                  Delivery agent will contact this number for courier delivery verification.
                </span>
              </div>

              {/* District & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B] focus:border-transparent transition-all cursor-pointer"
                  >
                    {BD_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Thana / Upazila / Area
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mirpur-10, Dhanmondi"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Street Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Full Detailed Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House number, Road / Lane number, Floor / Flat, Landmark..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Order Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Delivery Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before arrival, leave at reception"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B] focus:border-transparent transition-all"
                />
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Wallet Payment Box (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Items Summary Card */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[6px_6px_20px_rgba(15,23,42,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Order Items ({cart.reduce((t, i) => t + i.quantity, 0)})
                </h3>
                <Link
                  href="/products"
                  className="text-xs text-[#009F6B] font-bold hover:underline"
                >
                  Edit Cart
                </Link>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Qty: {item.quantity} × ৳{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      ৳{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">৳{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#009F6B]">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="text-xl text-[#009F6B]">৳{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Wallet Payment Clearance Card */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-[6px_6px_20px_rgba(15,23,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Payment Clearance
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Strictly paid via EarnX Wallet Balance (No COD)
                  </p>
                </div>
              </div>

              {/* Wallet Balance Status Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Your Current Balance:</span>
                  <strong className="text-sm font-extrabold text-slate-900">
                    ৳{walletBalance.toFixed(2)}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Order Deductible:</span>
                  <strong className="text-sm font-extrabold text-[#009F6B]">
                    -৳{cartTotal.toFixed(2)}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500">Balance After Order:</span>
                  <strong className={`font-bold ${isBalanceSufficient ? 'text-emerald-700' : 'text-red-500'}`}>
                    {isBalanceSufficient ? `৳${remainingBalanceAfter.toFixed(2)}` : 'Insufficient Funds'}
                  </strong>
                </div>
              </div>

              {/* Insufficient Balance Callout */}
              {!isBalanceSufficient && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Insufficient Wallet Balance</p>
                      <p className="mt-0.5 text-amber-700 leading-relaxed font-normal">
                        You need an additional <strong>৳{balanceDifference.toFixed(2)}</strong> to complete this purchase. Deposit funds via bKash, Nagad, or Rocket to proceed.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/deposit"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Deposit ৳{balanceDifference.toFixed(2)} to Wallet</span>
                  </Link>
                </div>
              )}

              {/* Payment Submit Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting || !isBalanceSufficient}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white text-sm font-bold shadow-[4px_4px_16px_rgba(0,159,107,0.35)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ৳{cartTotal.toFixed(2)} from Wallet</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#009F6B]" />
                <span>Protected Escrow • 100% Genuine Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
