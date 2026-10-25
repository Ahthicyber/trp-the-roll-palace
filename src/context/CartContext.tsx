'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, DeliveryZone } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
  variant_name?: string;
  addons?: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant_name?: string, addons?: string[]) => void;
  removeItem: (productId: string, variant_name?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant_name?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  selectedZone: DeliveryZone | null;
  setSelectedZone: (zone: DeliveryZone | null) => void;
  deliveryFee: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Restore cart on mount for customer convenience in browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trp_cart_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save changes to local storage for customer convenience
  useEffect(() => {
    try {
      localStorage.setItem('trp_cart_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (product: Product, quantity = 1, variant_name = '', addons: string[] = []) => {
    setItems(prev => {
      const key = `${product.id}_${variant_name}`;
      const existingIndex = prev.findIndex(
        i => `${i.product.id}_${i.variant_name || ''}` === key
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        return [...prev, { product, quantity, variant_name, addons }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number, variant_name = '') => {
    if (quantity <= 0) {
      removeItem(productId, variant_name);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId && (item.variant_name || '') === variant_name) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string, variant_name = '') => {
    setItems(prev =>
      prev.filter(item => !(item.product.id === productId && (item.variant_name || '') === variant_name))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.discount_percent > 0
      ? item.product.price * (1 - item.product.discount_percent / 100)
      : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        selectedZone,
        setSelectedZone,
        deliveryFee,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
