'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Phone, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#05090b]/90 backdrop-blur-md border-b border-[#22252a]">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-[#17120a] via-[#241a0b] to-[#17120a] border-b border-[#352a13] px-4 py-1.5 text-xs text-[#ffc52f] flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#bdbdbd]">
            <Clock className="w-3.5 h-3.5 text-[#ffc52f]" /> 4:00 PM – 3:00 AM
          </span>
          <span className="hidden sm:inline text-[#4a402d]">|</span>
          <span className="hidden sm:inline text-white font-medium">ONE BITE – FULL FLAVOUR</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/923243235253"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="font-semibold">0324-3235253</span>
          </a>
          <Link
            href="/track"
            className="hidden md:inline-block text-xs bg-[#221c10] text-[#ffc52f] hover:bg-[#ffc52f] hover:text-black px-2.5 py-0.5 rounded transition font-medium"
          >
            Track Order
          </Link>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#ffc52f] shadow-lg shadow-[#ffc52f]/10 bg-black flex-shrink-0">
            <Image
              src="/images/trp-logo.png"
              alt="TRP - The Roll Palace Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white group-hover:text-[#ffc52f] transition-colors leading-tight">
              THE ROLL PALACE
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#ffc52f] uppercase">
              TASTE THAT RULES
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-white hover:text-[#ffc52f] transition-colors">
            Home
          </Link>
          <a href="#menu" className="text-sm font-semibold text-[#bdbdbd] hover:text-[#ffc52f] transition-colors">
            Menu
          </a>
          <a href="#special" className="text-sm font-semibold text-[#bdbdbd] hover:text-[#ffc52f] transition-colors">
            Lava Specials
          </a>
          <a href="#about" className="text-sm font-semibold text-[#bdbdbd] hover:text-[#ffc52f] transition-colors">
            About
          </a>
          <Link href="/track" className="text-sm font-semibold text-[#bdbdbd] hover:text-[#ffc52f] transition-colors">
            Track Order
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Cart"
            className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#151515] hover:bg-[#202020] border border-[#2c2c2c] text-white transition-all hover:border-[#ffc52f]/50 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 text-[#ffc52f]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ffc52f] text-black font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {itemCount}
              </span>
            )}
          </button>

          {/* Order Now CTA */}
          <a
            href="#menu"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-lg shadow-[#ffc52f]/20 transition-all transform active:scale-95"
          >
            Order Now
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#ffc52f]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0f12] border-b border-[#22252a] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-white hover:text-[#ffc52f]"
          >
            Home
          </Link>
          <a
            href="#menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-white hover:text-[#ffc52f]"
          >
            Browse Menu
          </a>
          <a
            href="#special"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-white hover:text-[#ffc52f]"
          >
            TRP Lava Specials
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-white hover:text-[#ffc52f]"
          >
            About & Contact
          </a>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#ffc52f] hover:underline"
          >
            Track Your Order
          </Link>
          <div className="pt-2">
            <a
              href="https://wa.me/923243235253"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-md"
            >
              <Phone className="w-4 h-4" /> Order on WhatsApp (03243235253)
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
