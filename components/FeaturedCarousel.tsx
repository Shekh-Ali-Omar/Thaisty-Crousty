"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { GlassCard } from "@/components/glass/GlassCard";

type Props = {
  products: Product[];
  title: string;
};

export function FeaturedCarousel({ products, title }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  if (!products.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link
          href="/menu"
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-secondary"
        >
          Menu <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {products.map((p, i) => (
          <GlassCard
            key={p.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="w-[72vw] max-w-[280px] shrink-0 snap-center overflow-hidden p-0"
          >
            <button
              type="button"
              className="flex w-full flex-col text-start"
              onClick={() =>
                addItem({
                  productId: p.id,
                  name: p.name,
                  price: Number(p.price),
                  image: p.image,
                })
              }
            >
              <div className="relative h-40 w-full">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-bold leading-tight">{p.name}</p>
                  <p className="text-primary font-semibold">
                    {formatPrice(Number(p.price))}
                  </p>
                </div>
              </div>
            </button>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
