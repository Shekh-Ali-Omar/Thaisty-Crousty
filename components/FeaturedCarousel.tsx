"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface Props {
  products: Product[];
  title?: string;
}

export function FeaturedCarousel({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory px-4 md:px-0">
        {products.map((p, i) => (
          <div key={p.id} className="flex-none w-[280px] md:w-[350px] snap-start">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
