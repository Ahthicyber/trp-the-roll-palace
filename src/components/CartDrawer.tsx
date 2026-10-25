'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DeliveryZone } from '@/lib/types';
import CheckoutModal from './CheckoutModal';

interface CartDrawerProps {
  deliveryZones: DeliveryZone[];
}

export default function CartDrawer({ deliveryZones }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    selectedZone,
    setSelectedZone,
    deliveryFee,
    grandTotal,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Pickup'>('Delivery');

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#101215] border-l border-[#24272e] shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-5 border-b border-[#212429] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#ffc52f]" />
                <h2 className="text-lg font-bold text-white">Your Order</h2>
                <span className="text-xs bg-[#24272e] text-[#ffc52f] px-2 py-0.5 rounded-full font-bold">
                  {items.length} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#1f2227] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#1b1e24] flex items-center justify-center text-[#ffc52f]">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                  <h3 className="font-bold text-white text-base">Your cart is empty</h3>
                  <p className="text-xs text-[#8e8e8e] max-w-xs mx-auto">
                    Looks like you haven&apos;t added any delicious TRP items yet.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 inline-flex px-4 py-2 text-xs font-bold bg-[#ffc52f] text-black rounded-xl hover:bg-[#e5a812]"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                items.map(item => {
                  const unitPrice = item.product.discount_percent > 0
                    ? item.product.price * (1 - item.product.discount_percent / 100)
                    : item.product.price;
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}_${item.variant_name || ''}`}
                      className="p-3 rounded-2xl bg-[#16181d] border border-[#23272e] flex items-center gap-3"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                            TRP
                          </div>
                        )}
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-[#ffc52f] font-semibold mt-0.5">
                          Rs. {unitPrice.toLocaleString('en-PK')} each
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-[#20242b] rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant_name)}
                              className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-[#ffc52f] hover:text-black transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant_name)}
                              className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-[#ffc52f] hover:text-black transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id, item.variant_name)}
                            className="text-[#777] hover:text-red-400 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-white">
                          Rs. {lineTotal.toLocaleString('en-PK')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Proceed */}
            {items.length > 0 && (
              <div className="p-5 border-t border-[#212429] bg-[#12151a] space-y-4">
                {/* Delivery vs Pickup Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#1c1f26] rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setDeliveryType('Delivery')}
                    className={`py-2 rounded-lg transition-all ${
                      deliveryType === 'Delivery'
                        ? 'bg-[#ffc52f] text-black shadow'
                        : 'text-[#9c9c9c] hover:text-white'
                    }`}
                  >
                    Home Delivery
                  </button>
                  <button
                    onClick={() => {
                      setDeliveryType('Pickup');
                      setSelectedZone(null);
                    }}
                    className={`py-2 rounded-lg transition-all ${
                      deliveryType === 'Pickup'
                        ? 'bg-[#ffc52f] text-black shadow'
                        : 'text-[#9c9c9c] hover:text-white'
                    }`}
                  >
                    Takeaway / Pickup
                  </button>
                </div>

                {/* Delivery Zone Selector */}
                {deliveryType === 'Delivery' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3] block">
                      Select Delivery Zone
                    </label>
                    <select
                      value={selectedZone?.id || ''}
                      onChange={e => {
                        const zone = deliveryZones.find(z => z.id === e.target.value) || null;
                        setSelectedZone(zone);
                      }}
                      className="w-full bg-[#1c1f26] border border-[#2e333d] text-white text-xs rounded-xl p-2.5 outline-none focus:border-[#ffc52f]"
                    >
                      <option value="">Choose your area / distance...</option>
                      {deliveryZones.map(z => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {z.fee === 0 ? 'Fee to be confirmed' : `Rs. ${z.fee}`} ({z.estimated_time})
                        </option>
                      ))}
                    </select>
                    {selectedZone?.fee === 0 && (
                      <p className="text-[11px] text-[#ffc52f]">
                        * Delivery fee for this zone will be confirmed with the restaurant team.
                      </p>
                    )}
                  </div>
                )}

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs text-[#a6a6a6] pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">
                      Rs. {subtotal.toLocaleString('en-PK')}
                    </span>
                  </div>
                  {deliveryType === 'Delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-white font-semibold">
                        {selectedZone
                          ? selectedZone.fee === 0
                            ? 'To be confirmed'
                            : `Rs. ${deliveryFee}`
                          : 'Select zone'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#262a33]">
                    <span>Total</span>
                    <span className="text-[#ffc52f]">
                      Rs. {grandTotal.toLocaleString('en-PK')}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-base bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-lg shadow-[#ffc52f]/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          deliveryType={deliveryType}
          deliveryZones={deliveryZones}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
}
