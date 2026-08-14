"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLocale } from "@/components/locale-provider";
import { formatPrice, cn } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/image";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/lib/hooks";

export function CartDrawer() {
  const { t, locale } = useLocale();
  const isHydrated = useHydrated();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setNote = useCartStore((s) => s.setNote);
  const total = useCartStore((s) => s.totalPrice());

  if (!isHydrated) return null;

  const isRtl = locale === "ar";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            initial={{ x: isRtl ? "-100%" : "100%", opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? "-100%" : "100%", opacity: 1 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "fixed bottom-0 top-0 z-[70] flex w-full max-w-lg flex-col bg-[#0a0a0a] t-grain shadow-2xl end-0 border-s-2 border-[#1a1a1a]"
            )}
            role="dialog"
            aria-label={t.cart.title}
          >
            <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] px-6 py-6 bg-[#0a0a0a]/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <h2 className="t-display text-4xl text-white mt-1">{t.cart.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="flex h-12 w-12 items-center justify-center text-white/50 hover:text-[#F58220] transition-colors"
                aria-label="Close"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6">
                  <ShoppingBag className="h-20 w-20 text-white/10" />
                  <p className="font-barlow-condensed text-2xl font-bold uppercase text-white/50">{t.cart.empty}</p>
                  <button className="t-btn-ghost mt-2" onClick={closeCart}>
                    {t.profile.continue_shopping} <span className="t-arrow rtl:-scale-x-100">→</span>
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-4 p-6">
                  {items.map((item) => {
                    const itemImageUrl = resolveProductImageUrl(item.image);
                    return (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="t-card p-4"
                      >
                        <div className="flex gap-4">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#111]">
                            {itemImageUrl ? (
                              <Image
                                src={itemImageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-[#111] text-3xl">
                                🍗
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-barlow-condensed text-2xl font-bold uppercase text-white leading-tight pe-4">{item.name}</p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="text-white/30 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            
                            <p className="t-price text-2xl text-[#F58220] mt-1">
                              {formatPrice(item.price)}
                            </p>
                            
                            <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                              {/* Quantity Selector */}
                              <div className="flex items-center border-2 border-white bg-[#0a0a0a]">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="grid h-10 w-10 place-items-center hover:bg-white/5 transition-colors text-white"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="t-display w-10 text-center text-xl text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="grid h-10 w-10 place-items-center hover:bg-white/5 transition-colors text-white"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <span className="t-price text-2xl text-white">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                            
                            <Input
                              placeholder={t.cart.notePlaceholder}
                              value={item.note ?? ""}
                              onChange={(e) =>
                                setNote(item.productId, e.target.value)
                              }
                              className="t-field mt-4 h-10 text-sm border-white placeholder:text-white"
                            />
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t-2 border-[#F58220] p-6 bg-[#0a0a0a]">
                <div className="mb-6 flex justify-between items-end">
                  <span className="font-barlow-condensed text-xl font-bold uppercase text-white/70">{t.cart.total}</span>
                  <span className="t-price text-4xl text-[#F58220]">{formatPrice(total)}</span>
                </div>

                <div className="flex gap-3">
                  <button className="t-btn-ghost flex-1 text-center px-2 py-3" onClick={closeCart}>
                    {t.profile.continue_shopping}
                  </button>
                  <Link href="/checkout" onClick={closeCart} className="t-btn flex-1 text-center text-xl px-2 py-3">
                    {t.cart.checkout} <span className="t-arrow rtl:-scale-x-100">→</span>
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
