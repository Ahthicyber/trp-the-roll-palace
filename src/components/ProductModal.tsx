'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Flame } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const displayPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#14161a] border border-[#2b2b2b] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-[#ffc52f] hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[260px] bg-[#0c0d0f]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#555]">
              TRP Food
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14161a] md:from-transparent via-transparent to-transparent" />
        </div>

        {/* Content Column */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-[#ffc52f]">
                {product.category_name}
              </span>
              {product.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffc52f] text-black">
                  <Flame className="w-3 h-3 fill-black" /> Popular Choice
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-white">{product.name}</h2>
            <p className="text-sm text-[#a8a8a8] mt-2 leading-relaxed">
              {product.description || 'Authentic Pakistani fast food prepared with freshly sourced ingredients, proprietary spices, and served piping hot.'}
            </p>
          </div>

          <div className="pt-4 border-t border-[#262626] space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-[#ffc52f]">
                  Rs. {(displayPrice * quantity).toLocaleString('en-PK')}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-[#8e8e8e] ml-2">
                    (Rs. {displayPrice.toLocaleString('en-PK')} each)
                  </span>
                )}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center bg-[#1d1d1d] border border-[#333] rounded-xl p-1 gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-[#272727] hover:bg-[#ffc52f] hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-white min-w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-[#272727] hover:bg-[#ffc52f] hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-base bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-lg shadow-[#ffc52f]/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Order • Rs. {(displayPrice * quantity).toLocaleString('en-PK')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

