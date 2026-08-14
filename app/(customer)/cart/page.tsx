"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks";

export default function CartPage() {
  const { t, locale } = useLocale();
  const isHydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.totalPrice());
  const delivery = 2.00; // Mock delivery fee for layout matching

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[68px] flex items-center justify-center">
         <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#F58220]/20 border-t-[#F58220]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
        <section className="mx-auto w-full px-4 py-16 md:px-8 text-center border-2 border-dashed border-[#1a1a1a] mt-10">
          <h1 className="t-display text-6xl md:text-7xl text-white mb-6 uppercase">
            {locale === "fr" ? (
              <>VOTRE <span className="text-[#F58220]">PANIER</span> EST VIDE</>
            ) : locale === "ar" ? (
              <><span className="text-[#F58220]">عربة التسوق</span> الخاصة بك فارغة</>
            ) : (
              <>YOUR <span className="text-[#F58220]">CART</span> IS EMPTY</>
            )}
          </h1>
          <p className="t-kicker text-white/50 mb-10">
            {t.cart.empty}
          </p>
          <Link
            href="/menu"
            className="t-btn"
          >
            {t.common.back_to_menu} <span className="t-arrow rtl:-scale-x-100">→</span>
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="mx-auto w-full px-4 py-10 md:px-8 md:py-16">
        <h1 className="t-display text-6xl md:text-7xl text-white uppercase mb-8">
          {locale === "fr" ? (
            <>VOTRE <span className="text-[#F58220]">{t.cart.title}</span></>
          ) : locale === "ar" ? (
            <><span className="text-[#F58220]">{t.cart.title}</span> الخاصة بك</>
          ) : (
            <>YOUR <span className="text-[#F58220]">{t.cart.title}</span></>
          )}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
          {/* ITEMS LIST */}
          <div className="t-panel">
            {items.map((item) => (
              <div
                key={item.productId}
                className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 border-b-2 border-white/10 p-4 last:border-b-0 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
              >
                <div className="h-20 w-20 border-2 border-[#1a1a1a] bg-[#0a0a0a] sm:h-24 sm:w-24 relative overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-[50%_78%]"
                    />
                  ) : (
                    <span className="text-2xl">🍗</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="t-kicker text-[#F58220] opacity-80">
                    CROUSTY
                  </p>
                  <h2 className="truncate t-display text-2xl text-white uppercase mt-1">{item.name}</h2>
                  <p className="mt-1 t-price text-xl text-white">{formatPrice(item.price)}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 mt-2 sm:mt-0">
                  <div className="flex items-center border-2 border-[#1a1a1a] bg-[#0a0a0a]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="grid h-11 w-11 place-items-center hover:bg-white/5 transition-colors text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center t-display text-xl text-white pt-1">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="grid h-11 w-11 place-items-center hover:bg-white/5 transition-colors text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="grid h-11 w-11 place-items-center border-2 border-white/10 bg-[#0a0a0a] hover:border-red-500 hover:text-red-500 transition-colors text-white/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY ASIDE */}
          <aside className="t-panel p-6 md:p-8 sticky top-[100px]">
            <h2 className="t-display text-3xl text-white uppercase">{t.cart.summary}</h2>
            
            <dl className="mt-6 space-y-4 t-kicker text-white/70">
              <div className="flex justify-between items-center">
                <dt>{t.cart.subtotal}</dt>
                <dd className="t-price text-xl text-white">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt>{locale === "fr" ? "Livraison" : locale === "ar" ? "التوصيل" : "Delivery"}</dt>
                <dd className="t-price text-xl text-white">{formatPrice(delivery)}</dd>
              </div>
              
              <div className="flex items-baseline justify-between border-t-2 border-white/10 pt-4 mt-6">
                <dt className="t-display text-2xl text-white">{t.cart.total}</dt>
                <dd className="t-price text-4xl text-[#F58220]">{formatPrice(total + delivery)}</dd>
              </div>
            </dl>
            
            <Link
              href="/checkout"
              className="t-btn w-full mt-8"
            >
              {t.cart.checkout} <span className="t-arrow rtl:-scale-x-100">→</span>
            </Link>
            
            <Link
              href="/menu"
              className="mt-4 block text-center t-kicker text-white/50 hover:text-white transition-colors underline underline-offset-4"
            >
              {locale === "fr" ? "Continuer vos achats" : locale === "ar" ? "مواصلة التسوق" : "Continue shopping"}
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
