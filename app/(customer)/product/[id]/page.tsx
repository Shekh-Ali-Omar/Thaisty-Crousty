"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, Check, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/components/locale-provider";
import { getProductById, getProducts } from "@/lib/products/repository";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/image";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/ProductCard";

function ChiliIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Slim stem */}
      <path
        d="M13.5 2C14.2 1.2 15.6 1 16.8 1.4C16.1 2.4 15 3.2 13.8 3.6"
        stroke="#0a0a0a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Calyx / cap */}
      <path
        d="M12.5 3.8C13.8 3.5 15.2 3.8 16 4.8C14.8 5 13.5 4.8 12.5 3.8Z"
        fill="#0a0a0a"
      />
      {/* Long slender curved hot chili body */}
      <path
        d="M14.8 4.6C12.8 5.2 9.2 7.2 8.5 11.5C7.8 15.8 9.5 19.2 11.8 22.2C12.4 22.8 13.1 22.4 13 21.6C12.4 18.2 12.5 14.8 13.6 11.4C14.4 9 15.2 6.8 15.5 5.2C15.6 4.8 15.2 4.5 14.8 4.6Z"
        fill="#0a0a0a"
      />
    </svg>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [sauce, setSauce] = useState("CURRY");
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProductById(id as string, locale),
      getProducts(locale)
    ])
      .then(([prod, allProducts]) => {
        setProduct(prod);
        
        // Randomize cross-sell products
        const others = allProducts.filter((p) => p.id !== id);
        const shuffled = others.sort(() => 0.5 - Math.random());
        setCrossSellProducts(shuffled.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [id, locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#F58220]/20 border-t-[#F58220]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] bg-[#0a0a0a] flex flex-col items-center justify-center gap-10 text-center px-4">
        <h1 className="t-display text-6xl text-white uppercase">{t.order.notFound}</h1>
        <button 
          className="t-btn"
          onClick={() => router.push('/menu')}
        >
          {t.common.back_to_menu}
        </button>
      </div>
    );
  }

  const primaryImage = resolveProductImageUrl(product.image_url || product.image);
  const allImages = [primaryImage, ...(product.images || []).map(img => resolveProductImageUrl(img))].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(allImages));
  const currentImageUrl = uniqueImages[selectedImageIndex] || primaryImage;

  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;
  const isSpicy = product.name.toLowerCase().includes('spicy') || product.description?.toLowerCase().includes('spicy');

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.discount_price ?? product.price),
      image: product.image,
    }, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => openCart(), 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Product Section */}
      <section className="t-grain border-b-2 border-[#F58220] bg-[#0a0a0a]">
        
        {/* Back button */}
        <div className="w-full mx-auto px-4 md:px-8 pt-4 md:pt-8 relative z-10">
           <button
             onClick={() => router.back()}
             className="flex items-center gap-2 t-kicker text-white/60 hover:text-[#F58220] transition-colors group"
           >
             <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1 rtl:rotate-180" />
             {t.checkout.back}
           </button>
        </div>

        <div className="mx-auto grid w-full gap-8 px-4 py-8 md:grid-cols-[1.15fr_1fr] md:gap-14 md:px-8 md:py-14 relative z-10">
          
          {/* GALLERY */}
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden border-2 border-[#1a1a1a] bg-[#111] relative">
              <AnimatePresence mode="wait">
                {currentImageUrl ? (
                  <motion.img
                    key={currentImageUrl}
                    src={currentImageUrl}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full object-cover object-[50%_78%]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-8xl">🍗</div>
                )}
              </AnimatePresence>
            </div>
            
            {/* BADGES CONTAINER */}
            <div className="absolute -start-2 top-4 z-20 flex flex-col gap-2 pointer-events-none">
              {product.is_featured ? (
                <span className="t-sticker-orange -rotate-3 text-sm md:text-base hover:rotate-0 transition-transform">
                  <Flame className="h-4 w-4 fill-black text-black" /> {locale === "ar" ? "الأكثر مبيعاً" : locale === "fr" ? "MEILLEURE VENTE" : "BEST SELLER"}
                </span>
              ) : product.is_special_offer ? (
                <span className="t-sticker-mustard -rotate-3 text-sm md:text-base hover:rotate-0 transition-transform">
                  <Sparkles className="h-4 w-4 fill-black text-black" /> {locale === "ar" ? "جديد" : locale === "fr" ? "NOUVEAU" : "NEW"}
                </span>
              ) : (
                <span className="t-sticker -rotate-3 text-sm md:text-base hover:rotate-0 transition-transform">
                  ★ {product.category || "CROUSTY"}
                </span>
              )}
              
              {isSpicy && (
                <span className="t-sticker-red rotate-2 text-sm md:text-base hover:rotate-0 transition-transform">
                  <ChiliIcon className="h-4 w-4" /> {locale === "ar" ? "حار" : locale === "fr" ? "PIQUANT" : "SPICY"}
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {uniqueImages.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {uniqueImages.map((img, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-none snap-start h-20 w-20 border-2 bg-[#111] transition-all cursor-pointer ${
                      selectedImageIndex === i 
                        ? "border-[#F58220] opacity-100" 
                        : "border-[#1a1a1a] opacity-60 hover:opacity-100 hover:border-white"
                    }`}
                  >
                    <img 
                      src={img} 
                      className={`h-full w-full object-cover object-[50%_78%] transition-all ${
                        selectedImageIndex === i ? "grayscale-0 opacity-100" : "grayscale hover:grayscale-0"
                      }`} 
                      alt="" 
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* BUY INFO */}
          <div className="flex flex-col">
            <p className="t-kicker text-[#F58220]">
              {product.category || "Thaisty"}
            </p>
            <h1 className="t-display mt-2 text-[14vw] rtl:text-[9vw] leading-[0.8] md:text-[6vw] md:rtl:text-[4vw] text-white">
              {product.name}
            </h1>
            <p className="mt-4 w-full text-lg text-white/50 font-barlow-condensed tracking-wide uppercase leading-relaxed">
              {product.description || "Poulet authentique avec sauce thaï originale, servi avec des accompagnements frais."}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="t-price text-5xl text-[#F58220]">
                {formatPrice(Number(product.discount_price ?? product.price))}
              </span>
              {hasDiscount && (
                <span className="t-price-old text-2xl text-white/40 line-through">
                  {formatPrice(Number(product.price))}
                </span>
              )}
            </div>

            {/* Customize: Sauce */}
            <div className="mt-8">
              <span className="t-label text-white/50">{locale === "ar" ? "اختر الصلصة الخاصة بك" : locale === "fr" ? "CHOISISSEZ VOTRE SAUCE" : "CHOOSE YOUR SAUCE"}</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory mt-2">
                {["CURRY", "WHITE", "SWEET", "SPICY", "MAYO"].map((s) => {
                  const isSelected = sauce === s;
                  const localizedSauce = s === "CURRY" ? (locale === "ar" ? "كاري" : "CURRY") : s === "WHITE" ? (locale === "ar" ? "بيضاء" : locale === "fr" ? "BLANCHE" : "WHITE") : s === "SWEET" ? (locale === "ar" ? "حلوة" : locale === "fr" ? "DOUCE" : "SWEET") : s === "SPICY" ? (locale === "ar" ? "حارة" : locale === "fr" ? "PIQUANTE" : "SPICY") : (locale === "ar" ? "مايونيز" : "MAYO");
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSauce(s)}
                      aria-pressed={isSelected}
                      className={`t-btn-quiet shrink-0 snap-center relative transition-colors duration-200 ${
                        isSelected 
                          ? "text-[#F58220]" 
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {localizedSauce}
                      {isSelected && (
                        <motion.span
                          layoutId="activeSauce"
                          className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F58220]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center border-2 border-white bg-[#0a0a0a]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="grid h-12 w-12 place-items-center hover:bg-white/10 transition-colors text-white active:scale-95"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="t-display w-12 text-center text-2xl text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(quantity + 1)}
                  className="grid h-12 w-12 place-items-center hover:bg-white/10 transition-colors text-white active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className={`t-btn flex-1 text-xl transition-all ${
                  product.is_available
                    ? added ? "!bg-green-500 !text-black !border-green-500" : ""
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {product.is_available ? (
                  added ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-6 w-6 stroke-[3]" /> {locale === "ar" ? "تمت الإضافة!" : locale === "fr" ? "AJOUTÉ !" : "ADDED!"}
                    </span>
                  ) : (
                    <>{locale === "ar" ? "أضف إلى السلة" : locale === "fr" ? "AJOUTER AU PANIER" : "ADD TO CART"} <span className="t-arrow rtl:-scale-x-100">→</span></>
                  )
                ) : (
                  t.menu.unavailable
                )}
              </motion.button>
            </div>

            <p className="mt-4 t-kicker text-white/30">
              {locale === "ar" ? "مستوى القرمشة" : locale === "fr" ? "NIVEAU DE CROQUANT" : "CRUNCH LEVEL"} <span className="text-[#F58220]">{"■".repeat(5)}</span>
              <span>{"■".repeat(0)}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Cross-Sell Section */}
      <section className="w-full mx-auto px-4 py-16 md:px-8">
        <h2 className="t-display text-4xl md:text-5xl text-white mb-6">
          {locale === "ar" ? (<>يتماشى <span className="text-[#F58220]">بقوة</span> مع</>) : locale === "fr" ? (<>IDÉAL <span className="text-[#F58220]">AVEC</span></>) : (<>GOES <span className="text-[#F58220]">HARD</span> WITH</>)}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {crossSellProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
