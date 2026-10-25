'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05090b] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-[#ffc52f]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#111317] border border-[#242932] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#ffc52f] bg-black shadow-lg shadow-[#ffc52f]/10 mb-2">
            <Image
              src="/images/trp-logo.png"
              alt="TRP Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#ffc52f] block">
            Restaurant Management Portal
          </span>
          <h1 className="text-2xl font-black text-white">TRP Admin Login</h1>
          <p className="text-xs text-[#8e8e8e]">
            Sign in to manage orders, menu items, and restaurant operations.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#bdbdbd] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@trp.com"
                className="w-full bg-[#181c22] border border-[#2a2f38] focus:border-[#ffc52f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#bdbdbd] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181c22] border border-[#2a2f38] focus:border-[#ffc52f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-lg shadow-[#ffc52f]/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#1e2229] text-center text-[11px] text-[#666]">
          Secure server-side authentication with session tokens & audit logs.
        </div>
      </div>
    </div>
  );
}

