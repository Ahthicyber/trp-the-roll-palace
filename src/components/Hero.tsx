import React from 'react';
import Image from 'next/image';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#05090b] py-12 md:py-20 border-b border-[#1f2228]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#ffc52f]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 right-0 w-96 h-96 bg-[#ffc52f]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1711] border border-[#ffc52f]/30 text-[#ffc52f] text-xs font-bold tracking-wider uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#ffc52f]" />
              <span>ONE BITE – FULL FLAVOUR</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h2 className="text-sm uppercase tracking-widest text-[#bdbdbd] font-bold">
                TRP — THE ROLL PALACE
              </h2>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                TASTE THAT{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffc52f] via-[#ffd768] to-[#e5a812]">
                  RULES.
                </span>
              </h1>
            </div>

            {/* Sub-description */}
            <p className="text-base sm:text-lg text-[#bdbdbd] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience the pinnacle of Pakistani fast food. From our legendary crispy rolls and dripping{' '}
              <strong className="text-white font-semibold">Molten Lava Burgers</strong> to charcoal-smoked{' '}
              <strong className="text-white font-semibold">Tikka & Malai Boti</strong>, every bite is cooked fresh to order with premium ingredients.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-extrabold text-base bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-xl shadow-[#ffc52f]/20 transition-all transform hover:-translate-y-0.5"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#special"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-base bg-[#151515] hover:bg-[#202020] text-white border border-[#2d2d2d] hover:border-[#ffc52f]/50 transition-all"
              >
                <Flame className="w-5 h-5 text-[#ffc52f]" />
                <span>TRP Special Platters</span>
              </a>
            </div>

            {/* Trust points */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#1c1f24] max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-[#ffc52f]">44+</span>
                <span className="text-xs text-[#9c9c9c] font-medium">Authentic Items</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-[#ffc52f]">100%</span>
                <span className="text-xs text-[#9c9c9c] font-medium">Fresh Halal Meat</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-[#ffc52f]">3:00 AM</span>
                <span className="text-xs text-[#9c9c9c] font-medium">Late Night Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[460px] aspect-square rounded-3xl overflow-hidden border-2 border-[#2c271b] shadow-2xl shadow-[#ffc52f]/10 group">
              <Image
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85"
                alt="TRP Signature Crispy Burger"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Floating Chef Special Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#111317]/90 backdrop-blur-md border border-[#2b2518] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffc52f] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Bestseller
                  </span>
                  <h3 className="text-white font-bold text-base leading-tight">Crispy Lava Burger</h3>
                  <p className="text-xs text-[#bdbdbd]">Melted cheddar lava & crispy chicken</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8e8e8e] block">Starting at</span>
                  <span className="text-lg font-black text-[#ffc52f]">Rs. 650</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
