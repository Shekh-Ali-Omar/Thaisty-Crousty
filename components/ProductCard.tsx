"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/image";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassCard";

type Props = {
  product: Product;
  index?: number;
};

/**
 * REFINED PRODUCT CARD - Compact & Premium
 * Optimized for readability, information density, and brand consistency.
 */
export function ProductCard({ product, index = 0 }: Props) {
  const { t, locale } = useLocale();
  const available = product.is_available;
  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;
  const imageUrl = resolveProductImageUrl(product.image_url || product.image);

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <GlassCard
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -5 }}
        className="group flex flex-col overflow-hidden p-0 h-full border-white/5 hover:border-primary/40 transition-all duration-300 rounded-[1.5rem] shadow-lg"
      >
        {/* Visual Section */}
        <div className="relative aspect-square w-full overflow-hidden bg-foreground/5">
          {imageUrl ? (
            <motion.div 
                className="relative h-full w-full"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center bg-white/5 text-4xl">🍗</div>
          )}
          
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.is_special_offer && (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-[#630d16] text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg border border-white/10 flex items-center gap-1 backdrop-blur-md"
              >
                <Sparkles className="h-2.5 w-2.5 fill-current" />
                {locale === 'ar' ? 'عرض خاص' : locale === 'fr' ? 'Offre spéciale' : 'Special Offer'}
              </motion.div>
            )}
          </div>

          {!available && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <span className="rounded-md bg-foreground/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-foreground/70 border border-foreground/10">
                {t.menu.unavailable}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-50 z-10 pointer-events-none" />
          
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 text-foreground/60">
             <Star className="h-2.5 w-2.5 fill-primary text-primary border-none" />
             <span className="text-[9px] font-black">4.9</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-1 flex-col p-4 gap-2.5">
          <div className="space-y-1">
            <span className="text-[8px] text-primary font-black uppercase tracking-[0.2em]">
                {product.category || "Crousty"}
            </span>
            <h3 className="text-base font-black leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
              {product.name}
            </h3>
            {product.description && (
              <p className="line-clamp-2 text-[9px] text-muted font-medium leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between border-t border-foreground/5">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[9px] text-muted font-bold line-through decoration-error/50">
                  {formatPrice(Number(product.original_price))}
                </span>
              )}
              <span className="text-base font-black tracking-tight text-foreground">
                {formatPrice(Number(product.price))}
              </span>
            </div>
            
            <Button
              variant="default"
              disabled={!available}
              className="h-8 px-4 rounded-xl bg-primary text-black font-black text-[9px] uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {t.home.cta}
            </Button>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
