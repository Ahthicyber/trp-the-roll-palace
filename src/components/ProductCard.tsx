'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Flame, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();

  const cartItem = items.find(i => i.product.id === product.id && !i.variant_name);
  const currentQuantity = cartItem?.quantity || 0;

  const displayPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#ffc52f]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#ffc52f]/5 overflow-hidden">
      {/* Product Image Header */}
      <div className="relative w-full h-48 bg-[#1e1e1e] overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#555] font-semibold text-sm">
            TRP – The Roll Palace
          </div>
        )}

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffc52f] text-black shadow-md">
              <Flame className="w-3 h-3 fill-black" /> Popular
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md">
              {product.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            aria-label="Quick View"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-[#ffc52f] hover:text-black text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Info Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          {product.category_name && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ffc52f]/90">
              {product.category_name}
            </span>
          )}
          <h3
            onClick={() => onQuickView?.(product)}
            className="font-bold text-base sm:text-lg text-white group-hover:text-[#ffc52f] transition-colors cursor-pointer line-clamp-1 mt-0.5"
          >
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#a3a3a3] line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Crafted fresh with signature TRP spices and secret recipe sauces.'}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black text-[#ffc52f]">
              Rs. {displayPrice.toLocaleString('en-PK')}
            </span>
            {product.discount_percent > 0 && (
              <span className="text-xs text-[#737373] line-through">
                Rs. {product.price.toLocaleString('en-PK')}
              </span>
            )}
          </div>

          {/* Cart Quantity or Add button */}
          {currentQuantity > 0 ? (
            <div className="flex items-center bg-[#202020] border border-[#ffc52f]/40 rounded-xl p-1 gap-2">
              <button
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                className="w-7 h-7 rounded-lg bg-[#2a2a2a] hover:bg-[#ffc52f] hover:text-black text-white flex items-center justify-center transition-colors font-bold text-sm cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-sm text-white px-1">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                className="w-7 h-7 rounded-lg bg-[#2a2a2a] hover:bg-[#ffc52f] hover:text-black text-white flex items-center justify-center transition-colors font-bold text-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#ffc52f] hover:bg-[#e5a812] text-black transition-all active:scale-95 shadow-md shadow-[#ffc52f]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

