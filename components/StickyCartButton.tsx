"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useLocale } from "@/components/locale-provider";
import { formatPrice } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks";

export function StickyCartButton() {
  const isHydrated = useHydrated();
  const pathname = usePathname();
  const { t } = useLocale();
  const itemCount = useCartStore((s) => s.totalItems());
  const total = useCartStore((s) => s.totalPrice());
  const openCart = useCartStore((s) => s.openCart);

  const hidden =
    pathname.startsWith("/admin") ||
    pathname === "/checkout" ||
    itemCount === 0;

  if (!isHydrated) return null;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          type="button"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={openCart}
          className="fixed bottom-24 left-4 right-4 z-40 flex h-16 items-center justify-between gap-4 rounded-2xl glass-premium px-6 font-bold shadow-[0_12px_40px_rgba(0,0,0,0.8)] md:bottom-8 md:left-auto md:right-8 md:w-[400px]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-6 w-6 text-primary glow-primary" />
              <motion.span
                key={itemCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              >
                {itemCount}
              </motion.span>
            </div>
            <span className="text-base text-foreground tracking-tight">
              {t.cart.viewCart}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-px bg-white/10 mx-2" />
            <span className="text-lg font-black text-primary glow-primary tracking-tighter">
              {formatPrice(total)}
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
