"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Flame, User, ShoppingBag, ShieldCheck, MapPin, UtensilsCrossed, Truck, Info, Phone, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 100) {
      setIsVisible(false);
      setIsMobileMenuOpen(false);
    } else {
      setIsVisible(true);
    }
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    { href: "/menu", label: t.nav.menu, icon: UtensilsCrossed },
    { href: "/track-order", label: t.nav.track, icon: Truck },
    { href: "/location", label: t.nav.location, icon: MapPin },
    { href: "/about", label: t.nav.about, icon: Info },
    { href: "/contact", label: t.nav.contact, icon: Phone },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 h-[72px] bg-[#0a0a0a] border-b-2 border-[#1a1a1a] t-grain transition-transform duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <nav className="mx-auto flex h-full w-full items-center justify-between px-6 md:px-12">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group shrink-0 no-underline">
            <div className="relative h-12 w-28 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt={BRAND_NAME}
                fill
                className="object-contain object-left rtl:object-right"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 mx-4 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-barlow-condensed font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                    isActive
                      ? "text-[#F58220]"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-base font-barlow-condensed font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                  pathname.startsWith("/admin")
                    ? "text-[#F58220]"
                    : "text-white/60 hover:text-white"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                {t.admin.dashboard}
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 md:gap-6 shrink-0">
            {/* Desktop Cart */}
            <button
              onClick={openCart}
              className="relative hidden md:flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label={t.nav.cart}
            >
              <ShoppingBag className="h-6 w-6" />
              {isHydrated && itemCount > 0 && (
                <span className="absolute -end-2 -top-2 flex h-4 min-w-[16px] items-center justify-center bg-[#F58220] px-1 text-[10px] font-barlow-condensed font-black text-black">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <Link
              href="/profile"
              className="flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label={t.nav.profile}
            >
              <User className="h-6 w-6" />
            </Link>

            {/* Mobile Menu Icon (Corner) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex md:hidden items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-[#F58220]" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer / Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[72px] z-40 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-[72px] inset-x-0 z-50 bg-[#0a0a0a] border-b-2 border-[#1a1a1a] t-grain px-6 py-6 shadow-2xl md:hidden"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "py-3.5 text-lg font-barlow-condensed font-bold uppercase tracking-widest transition-colors flex items-center justify-between border-b border-[#1a1a1a] last:border-b-0",
                        isActive
                          ? "text-[#F58220]"
                          : "text-white/70 hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {link.icon && <link.icon className="h-5 w-5" />}
                        {link.label}
                      </span>
                      <span className="text-sm opacity-40 rtl:-scale-x-100">→</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "py-3.5 text-lg font-barlow-condensed font-bold uppercase tracking-widest transition-colors flex items-center justify-between border-t border-[#1a1a1a] mt-1 pt-3.5",
                      pathname.startsWith("/admin")
                        ? "text-[#F58220]"
                        : "text-[#F58220]/80 hover:text-[#F58220]"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5" />
                      {t.admin.dashboard}
                    </span>
                    <span className="text-sm opacity-40 rtl:-scale-x-100">→</span>
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
