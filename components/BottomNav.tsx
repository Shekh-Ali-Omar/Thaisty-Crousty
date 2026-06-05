"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/lib/hooks";

const links = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/menu", icon: UtensilsCrossed, key: "menu" as const },
  { href: "/cart", icon: ShoppingBag, key: "cart" as const, openDrawer: true },
  { href: "/profile", icon: User, key: "profile" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const isHydrated = useHydrated();
  const itemCount = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe md:hidden">
      <div className="mx-auto mb-4 flex h-16 max-w-lg items-stretch justify-around rounded-[1.5rem] glass-premium border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {links.map(({ href, icon: Icon, key, openDrawer }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          const content = (
            <>
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-all duration-300", active ? "glow-primary scale-110" : "opacity-70")} strokeWidth={active ? 3 : 2} />
                {key === "cart" && isHydrated && itemCount > 0 && (
                  <span className="absolute -end-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black text-black shadow-[0_0_10px_rgba(255,140,0,0.5)]">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-bold tracking-tight transition-colors", active ? "text-primary" : "text-muted")}>
                {t.nav[key]}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary glow-primary" />
              )}
            </>
          );

          const className = cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-200",
            active ? "text-primary" : "text-muted"
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
