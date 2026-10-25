import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getProducts, getDeliveryZones, getRestaurantSettings } from '@/lib/db';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
import AboutContact from '@/components/AboutContact';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getRestaurantSettings();
  return {
    title: `${settings.name} — ${settings.tagline} | Online Ordering`,
    description: `Order Karachi's best rolls, crispy zinger burgers, molten lava burgers, charcoal BBQ, and fries directly from ${settings.name}. Delivery available until 3:00 AM!`,
    openGraph: {
      title: `${settings.name} — ${settings.headline}`,
      description: settings.announcement || 'ONE BITE – FULL FLAVOUR',
      images: ['/images/trp-logo.png'],
    },
  };
}

export default async function HomePage() {
  const categories = getCategories(true);
  const products = getProducts({ onlyAvailable: true });
  const deliveryZones = getDeliveryZones(true);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#05090b] text-white flex flex-col justify-between selection:bg-[#ffc52f] selection:text-black">
        <div>
          <Header />
          <Hero />
          <MenuSection
            initialCategories={categories}
            initialProducts={products}
          />
          <AboutContact />
        </div>
        <Footer />
        <CartDrawer deliveryZones={deliveryZones} />
      </div>
    </CartProvider>
  );
}
