"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassCard";

type Props = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: Props) {
  const { t } = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const available = product.is_available;

  const handleAdd = () => {
    if (!available) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
    });
  };

  return (
    <GlassCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group flex flex-col overflow-hidden p-0 h-full border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2rem]"
    >
      {/* Top: Image Section */}
      <div className="relative aspect-square w-full overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/5 text-4xl">
            🍗
          </div>
        )}
        
        {/* Availability Overlay */}
        {!available && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-full bg-red-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/30">
              {t.menu.unavailable}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: Info Section */}
      <div className="flex flex-1 flex-col p-4 md:p-5 gap-1.5 md:gap-2">
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] text-primary/80 uppercase tracking-widest font-black mb-1">
            {product.category || "Main"}
          </span>
          <h3 className="text-sm md:text-lg font-black leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>
        
        {product.description && (
          <p className="line-clamp-2 text-[10px] md:text-xs text-muted leading-relaxed font-medium">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3 md:pt-4 flex items-center justify-between">
          <span className="text-sm md:text-xl font-black text-white tracking-tighter">
            {formatPrice(Number(product.price))}
          </span>
          
          <Button
            size="icon"
            variant="default"
            disabled={!available}
            onClick={handleAdd}
            className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-primary text-black shadow-[0_4px_20px_rgba(255,140,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,140,0,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label={`${t.menu.add} ${product.name}`}
          >
            <Plus className="h-5 w-5 md:h-6 md:w-6" strokeWidth={3} />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
