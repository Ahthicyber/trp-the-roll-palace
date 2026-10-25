'use client';

import React, { useState, useMemo } from 'react';
import { Search, Flame, Sparkles } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

interface MenuSectionProps {
  initialCategories: Category[];
  initialProducts: Product[];
}

export default function MenuSection({ initialCategories, initialProducts }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products based on category and search
  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category_id === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialProducts, activeCategory, searchQuery]);

  // Featured Lava Specials
  const lavaSpecials = useMemo(() => {
    return initialProducts.filter(p => p.name.toLowerCase().includes('lava') || p.category_name?.toLowerCase().includes('special'));
  }, [initialProducts]);

  return (
    <section id="menu" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* TRP Lava Specials Banner */}
      <div id="special" className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#17130a] via-[#201809] to-[#120f08] border border-[#ffc52f]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ffc52f]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffc52f]/10 border border-[#ffc52f]/30 text-[#ffc52f] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Signature Creations
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              TRP Special Items & <span className="text-[#ffc52f]">Cheese Lava Explosions</span>
            </h2>
            <p className="text-sm text-[#bdbdbd] max-w-2xl mt-1">
              Dive into our chef&apos;s pride: Beef Lava Burgers, 4-Step Lava Sandwiches, Jumbo Lava Rolls, and the grand Lava Platter!
            </p>
          </div>
          <button
            onClick={() => {
              const specialCat = initialCategories.find(c => c.slug === 'trp-special-items');
              if (specialCat) setActiveCategory(specialCat.id);
            }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ffc52f] hover:bg-[#e5a812] text-black font-extrabold text-sm transition-all shadow-md cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-black" />
            <span>View All Specials ({lavaSpecials.length})</span>
          </button>
        </div>
      </div>

      {/* Main Menu Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#212429]">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block mb-1">
            Authentic Flavour Selection
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Explore Our Menu
          </h2>
          <p className="text-sm text-[#9e9e9e] mt-1">
            Pick from 44+ handcrafted Pakistani fast-food delights. Fresh, hot, and prepared upon order.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search burgers, rolls, BBQ..."
            className="w-full bg-[#121417] text-white border border-[#2c2f35] focus:border-[#ffc52f] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors placeholder-[#666]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-5 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#ffc52f] text-black shadow-lg shadow-[#ffc52f]/20'
              : 'bg-[#151515] text-[#b3b3b3] hover:text-white border border-[#262626]'
          }`}
        >
          All Items ({initialProducts.length})
        </button>
        {initialCategories.map(cat => {
          const count = initialProducts.filter(p => p.category_id === cat.id).length;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#ffc52f] text-black shadow-lg shadow-[#ffc52f]/20'
                  : 'bg-[#151515] text-[#b3b3b3] hover:text-white border border-[#262626]'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setSelectedProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#101215] rounded-3xl border border-[#22252a] mt-4">
          <p className="text-lg font-bold text-white">No menu items found</p>
          <p className="text-xs text-[#888] mt-1">
            Try adjusting your search query or switching to another category.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-black bg-[#ffc52f] rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
