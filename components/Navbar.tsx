"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, User, ShoppingBag, ShieldCheck, MapPin, Info, Phone, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { BRAND_NAME, BRAND_SUBTITLE } from "@/lib/constants";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const isHydrated = useHydrated();
  const itemCount = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setIsAdmin(!!data?.is_admin));
      }
    });
  }, []);

  const navLinks = [
    { href: "/menu", label: t.nav.menu },
    { href: "/track-order", label: t.nav.track, icon: Search },
    { href: "/location", label: t.nav.location, icon: MapPin },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <>
      <div className={cn(
          "fixed top-0 left-0 right-0 z-[49] h-24 scrim-top transition-opacity duration-500",
          isVisible ? "opacity-100" : "opacity-0"
      )} />

      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl glass-strong border border-white/5 px-4 shadow-2xl">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-primary glow-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-white uppercase">{BRAND_NAME}</span>
              <span className="text-[8px] font-bold text-muted uppercase tracking-[0.2em]">{BRAND_SUBTITLE}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 mx-4 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                    pathname.startsWith(link.href)
                      ? "bg-primary text-black shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.icon && <link.icon className="h-3 w-3" />}
                  {link.label}
                </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                  pathname.startsWith("/admin")
                    ? "bg-white text-black shadow-lg"
                    : "text-primary hover:bg-primary/10"
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {t.admin.dashboard}
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Cart */}
            <button
              onClick={openCart}
              className="relative hidden md:flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-white/10 transition-all"
              aria-label={t.nav.cart}
            >
              <ShoppingBag className="h-5 w-5 text-white/60" />
              {isHydrated && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-black shadow-lg">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Global Actions */}
            <div className="flex items-center gap-2 border-l border-white/5 ml-1 pl-3">
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                aria-label={t.nav.profile}
              >
                <User className="h-5 w-5 text-white/60" />
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>
    </>
  );
}
