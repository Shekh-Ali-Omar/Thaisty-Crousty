"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { fetchProducts } from "@/lib/products/fetch";

export function MenuContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "all"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts(locale)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const pCategory = p.category?.toLowerCase() || "";
      const pName = p.name?.toLowerCase() || "";
      const pDescription = p.description?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();

      const matchesCategory = category === "all" || pCategory === category;
      const matchesSearch = pName.includes(q) || pDescription.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, category, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-40">
      {/* Page Head */}
      <section className="t-grain relative overflow-hidden border-b-2 border-[#F58220] bg-[#0a0a0a] px-4 pt-32 pb-14 md:px-8 md:pt-40 md:pb-20">
        <div className="mx-auto w-full">
          <p className="t-kicker text-[#F58220]">{locale === "ar" ? "ابحث عن طبقك" : locale === "fr" ? "TROUVE TON BOL" : "FIND YOUR BOWL"}</p>
          <h1 className="t-display mt-3 text-[16vw] leading-[0.8] text-white md:text-[9vw]">
            {locale === "ar" ? (<>قائمة <span className="text-[#F58220]">الطعام</span></>) : locale === "fr" ? (<>LE <span className="text-[#F58220]">MENU</span></>) : (<>THE <span className="text-[#F58220]">MENU</span></>)}
          </h1>
        </div>
      </section>

      {/* Sticky Categories Bar */}
      <div className="sticky top-[68px] z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="px-4 py-3 md:px-8 w-full mx-auto flex items-center justify-between gap-4">
          <CategoryFilter active={category} onChange={setCategory} />
          
          <div className="relative hidden md:block w-72 shrink-0">
             <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white rtl:-scale-x-100" />
             <Input 
                placeholder={t.menu.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="t-field !ps-12 text-white rounded-none"
             />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="w-full mx-auto px-4 md:px-8 pt-10">
        {/* Mobile Search */}
        <div className="md:hidden relative mb-8">
             <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white rtl:-scale-x-100" />
             <Input 
                placeholder={t.menu.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="t-field !ps-12 text-white rounded-none"
             />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h2 className="t-display text-4xl md:text-5xl text-white">
            {category === "all" ? (
              locale === "ar" ? (<>الأكثر <span className="text-[#F58220]">مبيعاً</span></>) : locale === "fr" ? (<>MEILLEURES <span className="text-[#F58220]">VENTES</span></>) : (<>BEST <span className="text-[#F58220]">SELLERS</span></>)
            ) : (
              (t.menu.categories as any)[category] || category
            )}
          </h2>
          <span className="t-kicker text-[#F58220] px-4 py-2 border border-[#1a1a1a] self-start md:self-auto">
             {filtered.length} {t.menu.itemsCount}
          </span>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-[#111] border border-[#1a1a1a]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 border border-dashed border-[#1a1a1a] p-12 text-center bg-[#111]">
            <p className="t-display text-4xl text-[#F58220] mb-2">{t.menu.empty}</p>
            <p className="mb-6 text-white/50 font-barlow-condensed tracking-wide">
              {locale === "ar" ? "حاول البحث عن شيء آخر أو مسح الفلاتر." : locale === "fr" ? "Essayez de chercher autre chose ou d'effacer les filtres." : "Try searching for something else or clearing filters."}
            </p>
            <button
              onClick={() => { setCategory("all"); setSearchQuery(""); }}
              className="t-btn"
            >
              {t.menu.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, i) => (
              <div key={product.id} className={i % 5 === 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
                 <ProductCard product={product} index={i} tall={i % 5 === 0} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
