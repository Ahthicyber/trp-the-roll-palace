'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Bell,
  Store,
} from 'lucide-react';
import { RestaurantSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) setSettings(data.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSettings(data.settings);
      setSuccessMsg('Settings updated successfully and applied to public storefront!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-xs text-[#888]">
        Loading restaurant configuration from database...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2027]">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block mb-1">
            Storefront & Operational Config
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Restaurant Settings
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            Modify brand taglines, WhatsApp hotline, opening hours, announcements, and payment accounts.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black font-extrabold text-xs shadow-md hover:brightness-110 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Operational Status & Store Open Switch */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#ffc52f]" />
            <h3 className="text-base font-bold text-white">Live Storefront Status</h3>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#181c22] border border-[#2b303a]">
            <div>
              <span className="font-bold text-white text-sm block">Kitchen Taking Orders</span>
              <span className="text-xs text-[#888]">
                {settings.is_open ? 'Restaurant is actively accepting online orders.' : 'Store is marked closed.'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_open}
                onChange={e => setSettings({ ...settings, is_open: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2f38] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffc52f]"></div>
            </label>
          </div>
        </div>

        {/* Brand Information */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <h3 className="text-base font-bold text-white">Brand & Identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">Restaurant Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none font-bold text-[#ffc52f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">Hero Headline</label>
              <input
                type="text"
                value={settings.headline}
                onChange={e => setSettings({ ...settings, headline: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">Currency Code & Symbol</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  className="w-1/2 bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={e => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-1/2 bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none text-[#ffc52f] font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <h3 className="text-base font-bold text-white">Contact & Opening Hours</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                WhatsApp Ordering Number (Digits only e.g. 923243235253)
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono font-bold text-[#ffc52f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                Phone Hotline (Display Format)
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">Opening Hours</label>
              <input
                type="text"
                value={settings.opening_hours}
                onChange={e => setSettings({ ...settings, opening_hours: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b5b5b5] mb-1">Physical Address / Area</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Website Announcement Banner */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#ffc52f]" />
            <h3 className="text-base font-bold text-white">Storefront Announcement Banner</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
              Top Announcement Text
            </label>
            <textarea
              rows={2}
              value={settings.announcement || ''}
              onChange={e => setSettings({ ...settings, announcement: e.target.value })}
              placeholder="e.g. Try our signature Lava Burgers and late night BBQ platters!"
              className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl p-3 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Payment Methods & Account Details */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#ffc52f]" />
            <h3 className="text-base font-bold text-white">Payment Accounts Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Easypaisa */}
            <div className="p-4 rounded-2xl bg-[#181c22] border border-[#2b303a] space-y-3">
              <h4 className="font-bold text-white text-xs text-emerald-400">Easypaisa Details</h4>
              <div>
                <label className="block text-[11px] text-[#888] mb-1">Account Title</label>
                <input
                  type="text"
                  value={settings.easypaisa_title}
                  onChange={e => setSettings({ ...settings, easypaisa_title: e.target.value })}
                  className="w-full bg-[#13151a] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#888] mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.easypaisa_number}
                  onChange={e => setSettings({ ...settings, easypaisa_number: e.target.value })}
                  className="w-full bg-[#13151a] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* JazzCash */}
            <div className="p-4 rounded-2xl bg-[#181c22] border border-[#2b303a] space-y-3">
              <h4 className="font-bold text-white text-xs text-amber-400">JazzCash Details</h4>
              <div>
                <label className="block text-[11px] text-[#888] mb-1">Account Title</label>
                <input
                  type="text"
                  value={settings.jazzcash_title}
                  onChange={e => setSettings({ ...settings, jazzcash_title: e.target.value })}
                  className="w-full bg-[#13151a] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#888] mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.jazzcash_number}
                  onChange={e => setSettings({ ...settings, jazzcash_number: e.target.value })}
                  className="w-full bg-[#13151a] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-[#1c2027] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black font-extrabold text-sm shadow-md hover:brightness-110 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
