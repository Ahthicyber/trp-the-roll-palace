import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#040608] border-t border-[#1a1d22] text-[#8e8e8e] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#ffc52f] bg-black flex-shrink-0">
                <Image
                  src="/images/trp-logo.png"
                  alt="TRP Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-wider block">
                  THE ROLL PALACE
                </span>
                <span className="text-[10px] font-bold text-[#ffc52f] tracking-widest uppercase">
                  ONE BITE – FULL FLAVOUR
                </span>
              </div>
            </div>
            <p className="text-xs text-[#9c9c9c] max-w-sm leading-relaxed">
              Serving premium crispy rolls, signature molten cheese lava burgers, authentic charcoal BBQ, and late-night street food delights across the city.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <a href="#menu" className="hover:text-[#ffc52f] transition-colors">
                  Full Food Menu
                </a>
              </li>
              <li>
                <a href="#special" className="hover:text-[#ffc52f] transition-colors">
                  TRP Lava Specials
                </a>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#ffc52f] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-[#ffc52f] transition-colors">
                  About Our Kitchen
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Ordering & Admin */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Direct Ordering</h4>
            <p className="text-xs text-[#9c9c9c]">
              Fastest order confirmation via WhatsApp:
            </p>
            <a
              href="https://wa.me/923243235253"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#25D366] hover:underline"
            >
              <Phone className="w-4 h-4" /> 0324-3235253
            </a>
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#555] hover:text-[#ffc52f] transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Restaurant Staff & Admin Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-[#15171b] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TRP – The Roll Palace. All rights reserved.</p>
          <p className="text-[11px] text-[#666]">
            Built with Next.js, Supabase & Tailwind CSS • Production Ready
          </p>
        </div>
      </div>
    </footer>
  );
}
