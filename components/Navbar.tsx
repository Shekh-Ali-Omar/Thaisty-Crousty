"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, User } from "lucide-react";
import { useState, useEffect } from "react";
import { BRAND_NAME, BRAND_SUBTITLE } from "@/lib/constants";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/menu", label: t.nav.menu },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
    { href: "/location", label: t.nav.location },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 pt-4 md:pt-6",
        isScrolled ? "pt-2 md:pt-4" : "pt-4 md:pt-6"
      )}
    >
      <nav
        className={cn(
          "mx-auto max-w-6xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] border border-white/10",
          isScrolled
            ? "glass-strong py-2 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            : "glass py-3 px-5 md:px-8 shadow-xl"
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl glass-glow bg-primary/15 group-hover:scale-110 transition-transform duration-500">
              <Flame className="h-6 w-6 md:h-7 md:w-7 text-primary glow-primary" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base md:text-xl font-black text-gradient tracking-tighter">
                {BRAND_NAME}
              </span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-[0.3em] font-bold">
                {BRAND_SUBTITLE}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-5 py-2 text-sm font-bold transition-all duration-300 rounded-full hover:glass-glow",
                    active ? "text-primary glass-glow" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/menu"
              className="hidden md:inline-flex rounded-full bg-primary px-8 py-2.5 text-sm font-black text-black shadow-[0_4px_25px_rgba(255,140,0,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              {t.home.cta}
            </Link>
            
            {/* Mobile Profile Icon (Matches Design Reference) */}
            <Link 
              href="/profile"
              className="md:hidden h-10 w-10 rounded-xl glass border-white/10 flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Profile"
            >
              <User className="h-5 w-5 text-muted" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
