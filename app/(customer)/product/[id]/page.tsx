"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ShoppingBag, Plus, Minus, Star, Clock, Flame, Check, ChevronRight, Sparkles, Share2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { getProductById } from "@/lib/products/repository";
import type { Product } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { resolveProductGallery, resolveProductImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassCard";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/lib/hooks";

/**
 * REFINED PRODUCT DETAILS
 * Balanced layout, brand-aligned colors, and working mobile gestures.
 */
export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const isHydrated = useHydrated();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getProductById(id as string, locale)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id, locale]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-8 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-10 text-center px-4">
        <div className="h-32 w-32 rounded-[3rem] bg-white/5 flex items-center justify-center border border-white/10">
           <Flame className="h-16 w-16 text-muted" />
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase">{t.order.notFound}</h1>
        <Button size="lg" className="h-14 px-10 rounded-2xl" onClick={() => router.push('/menu')}>{t.common.back_to_menu}</Button>
      </div>
    );
  }

  const images = resolveProductGallery(product.images, product.image_url || product.image);
  const hasMultipleImages = images.length > 1;
  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
    }, quantity);
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => openCart(), 500);
  };

  const nextImage = () => setActiveImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImageIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 pt-6 md:pt-10 pb-20">
      <div className="flex items-center justify-between mb-8 px-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 text-muted hover:text-primary transition-all font-black uppercase text-[10px] tracking-[0.2em] group"
          >
            <div className="h-9 w-9 rounded-full glass flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <ChevronLeft className={cn("h-4 w-4", locale === "ar" && "rotate-180")} />
            </div>
            {t.checkout.back}
          </button>
          
          <button className="h-9 w-9 rounded-full glass flex items-center justify-center text-muted hover:text-foreground transition-all">
             <Share2 className="h-3.5 w-3.5" />
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Visual Engine */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden glass border-white/5 shadow-2xl group cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative h-full w-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -50) nextImage();
                  else if (offset.x > 50) prevImage();
                }}
              >
                {images[activeImageIndex] ? (
                  <Image
                    src={images[activeImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover pointer-events-none"
                    priority
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/5 text-[8rem]">🍗</div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Overlays */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
               <span className="glass px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-primary border-primary/20 backdrop-blur-md">
                  {product.category || "Premium"}
               </span>
               {product.is_special_offer && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-[#630d16] text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg shadow-lg border border-white/10 flex items-center gap-2 backdrop-blur-md"
                  >
                    <Sparkles className="h-3 w-3 fill-current animate-pulse" />
                    {locale === 'ar' ? 'عرض خاص' : locale === 'fr' ? 'Offre spéciale' : 'Special Offer'}
                  </motion.div>
               )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none opacity-40" />

            {hasMultipleImages && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none hidden md:flex">
                <button 
                  onClick={prevImage}
                  className="pointer-events-auto h-12 w-12 rounded-2xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 border-white/10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="pointer-events-auto h-12 w-12 rounded-2xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 border-white/10"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
            
            {hasMultipleImages && (
                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-20">
                    {images.map((_, i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                activeImageIndex === i ? "w-6 bg-primary shadow-lg" : "w-1.5 bg-white/20"
                            )} 
                        />
                    ))}
                </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    activeImageIndex === idx 
                        ? "border-primary scale-105 shadow-md" 
                        : "border-white/5 opacity-40 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${idx}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informational Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-6 flex flex-col gap-8 w-full"
        >
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-success font-black text-[9px] uppercase tracking-[0.3em]">
                <Check className="h-3 w-3" />
                {t.product?.authorized_listing || "Authorized Listing"}
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                {product.name}
             </h1>
             
             <div className="flex items-end gap-4">
                <p className="text-4xl font-black tracking-tight text-primary glow-primary">
                  {formatPrice(Number(product.price))}
                </p>
                {hasDiscount && (
                   <p className="text-lg text-muted font-black line-through mb-1.5 uppercase tracking-wider">
                      {formatPrice(Number(product.original_price))}
                   </p>
                )}
             </div>
          </div>

          <GlassCard className="p-6 md:p-8 border-white/5">
             <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-4">{t.product?.market_description || "Market Description"}</h3>
             <p className="text-lg text-foreground/80 leading-relaxed font-medium">
                {product.description || t.product?.description_fallback || "Every ingredient is selected for maximum crunch and artisanal flavor."}
             </p>
             
             <div className="mt-8 grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t.order.etaVal}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 fill-primary text-primary border-none" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t.product?.market_rating || "Market Rating"}</span>
                </div>
             </div>
          </GlassCard>

          <div className="flex flex-col gap-6">
             <div className="flex flex-col sm:flex-row items-center gap-4">
                 <div className="flex items-center gap-4 rounded-2xl glass p-2 border-white/10 shadow-inner w-full sm:w-auto justify-between px-6 sm:px-2">
                    <button
                      className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-background/10 transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="min-w-8 text-center font-black text-2xl tracking-tighter">{quantity}</span>
                    <button
                      className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-background/10 transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                 </div>

                 <Button 
                    onClick={handleAddToCart}
                    size="lg" 
                    disabled={!product.is_available}
                    className={cn(
                        "h-14 w-full sm:flex-1 rounded-2xl font-black text-lg shadow-xl hover:scale-102 active:scale-98 transition-all gap-4",
                        added ? "bg-success text-white" : "bg-primary text-black"
                    )}
                 >
                    {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                    {added ? t.product?.selection_added || "Selection Added" : t.menu.add}
                 </Button>
             </div>
             
             <p className="text-[8px] text-center text-muted font-bold uppercase tracking-[0.4em]">
                {t.product?.platform_footer || "Thaisty Crousty - Premium Street Food Algiers"}
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
