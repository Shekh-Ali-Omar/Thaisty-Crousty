"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, Truck } from "lucide-react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/lib/hooks";

const links = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/menu", icon: UtensilsCrossed, key: "menu" as const },
  { href: "/cart", icon: ShoppingBag, key: "cart" as const, openDrawer: true },
  { href: "/track-order", icon: Truck, key: "track" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const isHydrated = useHydrated();
  const itemCount = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav 
      className={cn(
        "mobile-only md:hidden fixed bottom-0 left-0 right-0 z-[300] bg-[#0a0a0a] border-t border-[#1c1c1c] transition-transform duration-300 pb-[env(safe-area-inset-bottom)]",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-lg items-stretch justify-around px-2">
        {links.map(({ href, icon: Icon, key, openDrawer }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          const content = (
            <>
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", active ? "scale-110" : "")} strokeWidth={active ? 2.5 : 2} />
                {key === "cart" && isHydrated && itemCount > 0 && (
                  <span className="absolute -right-2 rtl:-left-2 rtl:right-auto -top-2 flex h-4 min-w-[16px] items-center justify-center bg-[#f58220] px-1 text-[10px] font-black text-[#0a0a0a]">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-barlow-condensed font-bold uppercase tracking-[0.1em] mt-1">
                {t.nav[key]}
              </span>
            </>
          );

          const className = cn(
            "relative flex flex-1 flex-col items-center justify-center transition-colors px-1",
            active ? "text-[#f58220]" : "text-white/40 hover:text-white/80"
          );

          if (openDrawer) {
            return (
              <button
                key={href}
                type="button"
                onClick={openCart}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={href} href={href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
