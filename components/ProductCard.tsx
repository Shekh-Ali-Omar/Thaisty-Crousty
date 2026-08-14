"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Flame } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/image";
import { useLocale } from "@/components/locale-provider";

function ChiliIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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

type Props = {
  product: Product;
  index?: number;
  tall?: boolean;
};

export function ProductCard({ product, tall = false, index = 0 }: Props) {
  const { t, locale } = useLocale();
  const available = product.is_available;
  
  const isNumberOne = index === 0;
  const isBest = !isNumberOne && (product.is_featured || index === 1 || product.name.toLowerCase().includes('classic'));
  const isSpicy = product.name.toLowerCase().includes('spicy') || product.description?.toLowerCase().includes('spicy') || product.category?.toLowerCase() === 'spicy';
  const isNew = Boolean(product.is_special_offer) || index === 2 || product.name.toLowerCase().includes('new');
  
  const imageUrl = resolveProductImageUrl(product.image_url || product.image);

  return (
    <article className="t-card group relative flex flex-col h-full hover:border-[#F58220]/70 transition-all duration-300">
      <div className="pointer-events-none absolute -left-2 rtl:-right-2 rtl:left-auto -top-3 z-10 flex flex-wrap gap-2">
        {/* WHITE BADGE: N°1 */}
        {isNumberOne && (
          <span className="t-sticker -rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-300">
            ★ N°1
          </span>
        )}

        {/* ORANGE BADGE: BEST SELLER */}
        {isBest && (
          <span className="t-sticker-orange rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-300">
            <Flame className="h-3 w-3 fill-black text-black" /> {locale === "ar" ? "الأكثر مبيعاً" : locale === "fr" ? "MEILLEURE VENTE" : "BEST SELLER"}
          </span>
        )}

        {/* MUSTARD YELLOW BADGE: NEW */}
        {isNew && (
          <span className="t-sticker-mustard -rotate-1 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-3 w-3 fill-black text-black" /> {locale === "ar" ? "جديد" : locale === "fr" ? "NOUVEAU" : "NEW"}
          </span>
        )}

        {/* RED BADGE: SPICY with Chili Pepper Icon */}
        {isSpicy && (
          <span className="t-sticker-red rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-300">
            <ChiliIcon className="h-3.5 w-3.5" /> {locale === "ar" ? "حار" : locale === "fr" ? "ÉPICÉ" : "SPICY"}
          </span>
        )}
      </div>

      <Link
        href={`/product/${product.id}`}
        className="relative block overflow-hidden aspect-square"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover object-[center_25%] scale-105 transition-transform duration-700 ease-out group-hover:scale-115"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍗</div>
        )}
        
        {!available && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm">
            <span className="t-sticker">
              {t.menu.unavailable}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="t-kicker text-white/50 mb-1">
            {product.category || 'CROUSTY'}
          </p>
          <h3 className="t-display text-3xl rtl:text-xl text-white group-hover:text-[#F58220] transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
        </div>
        <p className="line-clamp-2 text-sm text-white/50 font-barlow-condensed font-medium tracking-wide uppercase">
          {product.description || (locale === "ar" ? 'دجاج · صلصة بيضاء · بصل' : locale === "fr" ? 'Poulet · Sauce Blanche · Oignons' : 'Chicken · White Sauce · Onions')}
        </p>

        <div className="mt-auto pt-2 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="t-price text-3xl text-[#F58220] group-hover:scale-105 transition-transform origin-left">{formatPrice(Number(product.discount_price ?? product.price))}</span>
            {product.discount_price && (
               <span className="t-price-old text-lg">{formatPrice(Number(product.price))}</span>
            )}
          </div>
          <Link
            href={`/product/${product.id}`}
            className={`t-btn h-11 min-h-11 px-4 text-base ${
              available ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            {t.home.cta} <span className="t-arrow transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

