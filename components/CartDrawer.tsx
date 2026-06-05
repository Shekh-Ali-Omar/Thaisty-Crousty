"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLocale } from "@/components/locale-provider";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            initial={{ x: isRtl ? "-100%" : "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? "-100%" : "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "fixed bottom-0 top-0 z-[70] flex w-full max-w-md flex-col glass-strong md:bottom-4 md:top-4 md:rounded-2xl md:max-h-[calc(100dvh-2rem)]",
              isRtl ? "left-0 border-e border-white/10 md:ms-4" : "right-0 border-s border-white/10 md:me-4"
            )}
            role="dialog"
            aria-label={t.cart.title}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{t.cart.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="flex h-12 w-12 items-center justify-center rounded-xl glass hover:glass-strong"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <p className="py-16 text-center text-muted">{t.cart.empty}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-3"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-black/40 text-2xl">
                              🍗
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold leading-tight">{item.name}</p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="text-muted hover:text-red-400 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-primary font-medium">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="glass"
                              className="h-9 w-9"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="min-w-6 text-center font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="glass"
                              className="h-9 w-9"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="ms-auto text-sm font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                          <Input
                            placeholder={t.cart.notePlaceholder}
                            value={item.note ?? ""}
                            onChange={(e) =>
                              setNote(item.productId, e.target.value)
                            }
                            className="mt-2 h-9 text-xs glass border-white/10"
                          />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 p-4 glass">
                <div className="mb-3 flex justify-between text-lg font-bold">
                  <span>{t.cart.total}</span>
                  <span className="text-gradient">{formatPrice(total)}</span>
                </div>
                <Button asChild size="lg" className="w-full" onClick={closeCart}>
                  <Link href="/checkout">{t.cart.checkout}</Link>
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
