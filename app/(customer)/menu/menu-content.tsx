"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { getProducts } from "@/lib/products/repository";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/lib/hooks";

export function MenuContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) => s.totalItems());
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") ?? "all";

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "all" || p.category.toLowerCase() === category;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, searchQuery]);

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between mb-2">
        <h1 className="text-3xl font-black tracking-tight text-gradient">
          {t.menu.title}
        </h1>
        <button 
          onClick={openCart}
          className="relative h-12 w-12 rounded-2xl glass flex items-center justify-center border-white/10 active:scale-90 transition-transform"
        >
          <ShoppingBag className="h-6 w-6 text-primary" />
          {isHydrated && itemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-primary text-[10px] font-black text-black flex items-center justify-center px-1 shadow-[0_0_15px_rgba(255,140,0,0.6)]">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Header & Search */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="hidden md:block">
            <h1 className="text-6xl font-black tracking-tight text-gradient">
              {t.menu.title}
            </h1>
            <p className="mt-2 text-muted font-medium text-lg">
              {filtered.length} {t.menu.itemsCount}
            </p>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute start-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={t.menu.search} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 md:h-16 ps-14 rounded-[1.5rem] md:rounded-3xl glass border-white/5 focus:border-primary/30 focus:ring-primary/20 transition-all text-base md:text-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t.menu.filter}</span>
          </div>
          <CategoryFilter active={category} onChange={() => {}} />
        </div>
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-[2.5rem] glass-strong" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-24 text-center glass-strong rounded-[3rem] flex flex-col items-center gap-6"
        >
          <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center">
            <Search className="h-10 w-10 text-muted" />
          </div>
          <div>
            <p className="text-2xl font-black mb-2">{t.menu.empty}</p>
            <p className="text-muted font-medium">Try searching for something else or clearing filters.</p>
          </div>
          <button 
            onClick={() => {setSearchQuery("");}}
            className="h-12 px-8 rounded-2xl bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            {t.menu.clearFilters}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
