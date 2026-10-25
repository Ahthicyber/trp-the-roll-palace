'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle, MessageSquare, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DeliveryZone, Order } from '@/lib/types';

interface CheckoutModalProps {
  deliveryType: 'Delivery' | 'Pickup';
  deliveryZones: DeliveryZone[];
  onClose: () => void;
}

export default function CheckoutModal({
  deliveryType: initialDeliveryType,
  deliveryZones,
  onClose,
}: CheckoutModalProps) {
  const {
    items,
    clearCart,
    selectedZone,
    setSelectedZone,
    grandTotal,
    setIsCartOpen,
  } = useCart();

  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Pickup'>(initialDeliveryType);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Easypaisa' | 'JazzCash'>('Cash on Delivery');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const WHATSAPP_NUMBER = '923243235253';

  const validatePhone = (p: string) => {
    const cleaned = p.replace(/[\s-]/g, '');
    return /^(?:\+92|0092|92|0)?3[0-9]{9}$/.test(cleaned);
  };

  const handleSubmitOrder = async (isWhatsApp: boolean) => {
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g., 03243235253).');
      return;
    }

    if (deliveryType === 'Delivery' && !address.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Save authoritative order to persistent database via server API
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: phone.trim(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'Delivery' ? address.trim() : 'Pickup from Restaurant',
        delivery_zone_id: deliveryType === 'Delivery' ? selectedZone?.id : undefined,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        transaction_ref: transactionRef.trim() || undefined,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variant_name: item.variant_name,
          addons: item.addons,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      const createdOrder: Order = data.order;
      setPlacedOrder(createdOrder);
      clearCart();

      // 2. If WhatsApp ordering, generate message with real DB Order Number and open WhatsApp
      if (isWhatsApp) {
        const itemLines = createdOrder.items
          ?.map(i => `• ${i.product_name} x${i.quantity} = Rs. ${i.line_total.toLocaleString('en-PK')}`)
          .join('\n');

        const message = `*New Order — The Roll Palace (TRP)*\n` +
          `Order ID: *${createdOrder.order_number}*\n` +
          `Customer: ${createdOrder.customer_name}\n` +
          `Phone: ${createdOrder.customer_phone}\n` +
          `Type: ${createdOrder.delivery_type}\n` +
          (createdOrder.delivery_type === 'Delivery' ? `Address: ${createdOrder.delivery_address}\n` : '') +
          `\n*Items*\n${itemLines}\n\n` +
          (createdOrder.delivery_fee > 0 ? `Delivery Fee: Rs. ${createdOrder.delivery_fee}\n` : '') +
          `*Grand Total: Rs. ${createdOrder.total.toLocaleString('en-PK')}*\n` +
          `Payment: ${createdOrder.payment_method}` +
          (transactionRef ? ` (Ref: ${transactionRef})` : '') + `\n` +
          `Notes: ${createdOrder.notes || 'None'}\n\n` +
          `Please confirm this order. Thank you!`;

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while placing your order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#121418] border border-[#262b33] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        {!placedOrder && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#888] hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {placedOrder ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#ffc52f] uppercase tracking-wider">
                Order Received & Saved
              </span>
              <h2 className="text-2xl font-black text-white">Thank You, {placedOrder.customer_name}!</h2>
              <p className="text-sm text-[#bdbdbd]">
                Your order has been recorded in the TRP live restaurant database.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c22] border border-[#2b303a] text-left space-y-2 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-[#252b34]">
                <span className="text-[#888]">Order Number</span>
                <span className="font-mono font-black text-[#ffc52f] text-base">
                  {placedOrder.order_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Status</span>
                <span className="font-bold text-amber-400">{placedOrder.order_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Payment</span>
                <span className="text-white">{placedOrder.payment_method} ({placedOrder.payment_status})</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#252b34]">
                <span className="text-white">Total Amount</span>
                <span className="text-[#ffc52f]">Rs. {placedOrder.total.toLocaleString('en-PK')}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/track?number=${placedOrder.order_number}`}
                onClick={() => {
                  onClose();
                  setIsCartOpen(false);
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-lg text-center"
              >
                Track Live Order Status
              </Link>
              <button
                onClick={() => {
                  onClose();
                  setIsCartOpen(false);
                }}
                className="w-full py-3 rounded-xl font-semibold text-xs text-[#888] hover:text-white"
              >
                Close & Return to Menu
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-wider block">
                Final Step
              </span>
              <h2 className="text-2xl font-black text-white">Complete Your Order</h2>
              <p className="text-xs text-[#8e8e8e] mt-1">
                Order will be saved securely in the restaurant system.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                  Mobile Number (WhatsApp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="03243235253"
                  className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              {/* Delivery / Pickup Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#181c22] rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDeliveryType('Delivery')}
                  className={`py-2 rounded-lg transition-all ${
                    deliveryType === 'Delivery' ? 'bg-[#ffc52f] text-black shadow' : 'text-[#888]'
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('Pickup');
                    setSelectedZone(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    deliveryType === 'Pickup' ? 'bg-[#ffc52f] text-black shadow' : 'text-[#888]'
                  }`}
                >
                  Takeaway / Pickup
                </button>
              </div>

              {/* Delivery Address & Zone */}
              {deliveryType === 'Delivery' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                      Complete Delivery Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="House / Flat #, Street, Landmark, Area..."
                      className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl p-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                      Delivery Zone
                    </label>
                    <select
                      value={selectedZone?.id || ''}
                      onChange={e => {
                        const z = deliveryZones.find(item => item.id === e.target.value) || null;
                        setSelectedZone(z);
                      }}
                      className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="">Select distance zone...</option>
                      {deliveryZones.map(z => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {z.fee === 0 ? 'Confirmation required' : `Rs. ${z.fee}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Easypaisa">Easypaisa (Manual verification)</option>
                  <option value="JazzCash">JazzCash (Manual verification)</option>
                </select>
              </div>

              {/* Online Payment Instructions */}
              {(paymentMethod === 'Easypaisa' || paymentMethod === 'JazzCash') && (
                <div className="p-3.5 rounded-xl bg-[#1b1f26] border border-[#ffc52f]/30 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#ffc52f] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{paymentMethod} Transfer Details</span>
                  </div>
                  <div className="text-[#bdbdbd] space-y-0.5">
                    <p>Account Title: <strong className="text-white">TRP The Roll Palace</strong></p>
                    <p>Account / Mobile: <strong className="text-white">0324-3235253</strong></p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#a0a0a0] mb-1">
                      Transaction ID / Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      placeholder="e.g. TID 987123456"
                      className="w-full bg-[#13151a] border border-[#333a47] rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <p className="text-[10px] text-[#8e8e8e] italic">
                    Note: Orders paid via Easypaisa/JazzCash will be marked &quot;Pending Verification&quot; until verified by restaurant management.
                  </p>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                  Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. extra spicy, ketchup packets, call on arrival"
                  className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Total Review */}
            <div className="p-3.5 rounded-xl bg-[#181c22] border border-[#252b34] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#888] block">Payable Total</span>
                <span className="text-xl font-black text-[#ffc52f]">
                  Rs. {grandTotal.toLocaleString('en-PK')}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#888]">
                {items.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSubmitOrder(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Place Order on WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSubmitOrder(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-[#1f232b] hover:bg-[#282d37] text-white border border-[#333a46] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Order Directly (No WhatsApp)</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
