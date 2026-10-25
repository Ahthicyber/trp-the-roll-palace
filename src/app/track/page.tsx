'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  AlertCircle,
  Phone,
  ArrowLeft,
} from 'lucide-react';

const ORDER_STEPS = [
  { status: 'Pending', label: 'Order Received', desc: 'Sent to restaurant kitchen' },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Kitchen acknowledged order' },
  { status: 'Preparing', label: 'Cooking & Grilling', desc: 'Food is being freshly prepared' },
  { status: 'Ready', label: 'Ready', desc: 'Packed and ready for dispatch' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way' },
  { status: 'Delivered', label: 'Delivered', desc: 'Enjoy your meal!' },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('number') || searchParams.get('tracking') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (searchVal: string) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders?tracking=${encodeURIComponent(searchVal.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order not found. Please verify your order number.');
      }
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load order status.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchOrder(initialQuery);
    }
  }, [initialQuery]);

  const getStepIndex = (status: string) => {
    if (status === 'Completed') return 5;
    const idx = ORDER_STEPS.findIndex(s => s.status.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-[#05090b] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#1f2228] bg-[#0a0d10] py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#ffc52f] bg-black">
            <Image src="/images/trp-logo.png" alt="TRP Logo" fill className="object-cover" />
          </div>
          <div>
            <span className="text-base font-black text-white">THE ROLL PALACE</span>
            <span className="text-[10px] text-[#ffc52f] block uppercase tracking-widest font-bold">
              ORDER TRACKING
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8e8e8e] hover:text-[#ffc52f] font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-12 flex-1">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest">
            Real-Time Updates
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Track Your Food Order
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8e8e] max-w-md mx-auto">
            Enter your unique Order Number (e.g. TRP-104928) provided during checkout.
          </p>
        </div>

        {/* Search Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            fetchOrder(query);
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <input
              type="text"
              required
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. TRP-104928)"
              className="w-full bg-[#121519] border border-[#2b3038] focus:border-[#ffc52f] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none uppercase font-mono tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black font-extrabold text-sm hover:brightness-110 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Order Lookup Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="bg-[#121519] border border-[#262b33] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn">
            {/* Top Order Badge Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222731]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8e8e8e] block">
                  Order Number
                </span>
                <span className="text-2xl font-black text-[#ffc52f] font-mono">
                  {order.order_number}
                </span>
                <div className="text-xs text-[#888] mt-0.5">
                  Placed on: {new Date(order.created_at).toLocaleString('en-PK')}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between">
                <span className="text-xs text-[#8e8e8e]">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.order_status === 'Delivered' || order.order_status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : order.order_status === 'Cancelled'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[#ffc52f]/20 text-[#ffc52f] border border-[#ffc52f]/30 animate-pulse'
                }`}>
                  {order.order_status}
                </span>
              </div>
            </div>

            {/* Visual Timeline (if not cancelled) */}
            {order.order_status !== 'Cancelled' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e8e]">
                  Kitchen & Delivery Progress
                </h3>
                <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-[#2b303a]">
                  {ORDER_STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(order.order_status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.status} className="relative">
                        <div
                          className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-[#ffc52f] text-black shadow-lg shadow-[#ffc52f]/40 scale-125'
                              : isDone
                              ? 'bg-emerald-500 text-black'
                              : 'bg-[#1e2229] text-[#666] border border-[#333a46]'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isCurrent ? 'text-[#ffc52f]' : isDone ? 'text-white' : 'text-[#666]'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-[#888]">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800 text-red-200 text-sm">
                This order was cancelled by the restaurant or customer.
              </div>
            )}

            {/* Order Items Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[#222731]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e8e]">
                Order Items Summary
              </h3>
              <div className="divide-y divide-[#1e2229]">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white text-sm">{item.product_name}</span>
                      <span className="text-[#888] ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-white">
                      Rs. {item.line_total.toLocaleString('en-PK')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Totals */}
            <div className="p-4 rounded-2xl bg-[#171b22] border border-[#282f3a] space-y-2 text-xs">
              <div className="flex justify-between text-[#8e8e8e]">
                <span>Delivery Type</span>
                <span className="text-white font-medium">{order.delivery_type} ({order.delivery_zone_name || 'Standard'})</span>
              </div>
              <div className="flex justify-between text-[#8e8e8e]">
                <span>Payment Method</span>
                <span className="text-white font-medium">{order.payment_method} ({order.payment_status})</span>
              </div>
              <div className="flex justify-between text-[#8e8e8e]">
                <span>Subtotal</span>
                <span className="text-white font-medium">Rs. {order.subtotal?.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-[#8e8e8e]">
                <span>Delivery Fee</span>
                <span className="text-white font-medium">Rs. {order.delivery_fee?.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#252b36]">
                <span>Total Amount</span>
                <span className="text-[#ffc52f]">Rs. {order.total?.toLocaleString('en-PK')}</span>
              </div>
            </div>

            {/* Contact Support */}
            <div className="pt-2 text-center space-y-2">
              <p className="text-xs text-[#8e8e8e]">
                Questions regarding your order? Reach our dispatch team directly:
              </p>
              <a
                href="https://wa.me/923243235253"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-md"
              >
                <Phone className="w-4 h-4" /> Message TRP on WhatsApp (0324-3235253)
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1d22] py-6 text-center text-xs text-[#666]">
        TRP – The Roll Palace • Online Order Tracking
      </footer>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05090b] text-white flex items-center justify-center">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
