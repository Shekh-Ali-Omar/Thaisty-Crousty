"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassCard";
import { useHydrated } from "@/lib/hooks";

export default function CartPage() {
  const { t, locale } = useLocale();
  const isHydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.totalPrice());

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-6 opacity-0">
        <h1 className="text-3xl font-bold">{t.cart.title}</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-24 text-center glass-premium rounded-[2.5rem] px-6 max-w-2xl mx-auto">
        <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center animate-float">
          <ShoppingBag className="h-10 w-10 text-muted" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">{t.cart.empty}</h2>
          <p className="text-muted font-medium">{t.cart.emptySubtitle}</p>
        </div>
        <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.3)]">
          <Link href="/menu">{t.menu.title}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gradient">{t.cart.title}</h1>
        <p className="text-muted font-bold tracking-widest uppercase text-xs">{t.cart.review}</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
        <ul className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item, i) => (
            <motion.li
              key={item.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="flex gap-5 p-5 border-white/5 hover:border-primary/20 transition-all group">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="96px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-4xl bg-white/5">
                      🍗
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-primary font-black text-sm glow-primary">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-muted hover:text-red-400 p-2 hover:bg-red-400/10 rounded-xl transition-all h-fit"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 rounded-2xl glass p-1 border-white/10">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl hover:bg-white/5"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-8 text-center font-black">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl hover:bg-white/5"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-black text-lg tracking-tighter">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.li>
          ))}
        </ul>

        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <GlassCard className="p-8 glass-strong border-primary/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted mb-6">{t.cart.summary}</h3>
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between text-muted font-medium">
                <span>{t.cart.subtotal}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-muted font-medium">
                <span>{t.cart.delivery}</span>
                <span className="text-green-400">{t.cart.deliveryFree}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between text-2xl font-black tracking-tighter">
                <span>{t.cart.total}</span>
                <span className="text-gradient">{formatPrice(total)}</span>
              </div>
            </div>
            <Button asChild size="lg" className="w-full h-14 rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Link href="/checkout">
                {t.cart.checkout}
                <ArrowRight className={cn(locale === "ar" ? "mr-2 rotate-180" : "ml-2", "h-5 w-5")} />
              </Link>
            </Button>
          </GlassCard>
          
          <p className="text-[10px] text-muted text-center font-bold uppercase tracking-widest">
            {t.cart.secure}
          </p>
        </div>
      </div>
    </div>
  );
}
