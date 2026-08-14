"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BRAND_NAME } from "@/lib/constants";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionaries";

export function Footer() {
  const { t, locale, setLocale } = useLocale();
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative bg-[#0a0a0a] border-t-[2px] border-[#F58220]">
      {/* Decorative Grain */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

      <div className="mx-auto max-w-[1400px] px-4 py-14 md:px-8 relative z-10">
        <p className="font-anton text-[13vw] leading-[0.8] text-white md:text-[8vw]">
          {locale === "fr" ? (
            <>CROQUE <span className="text-[#F58220]">FORT.</span></>
          ) : locale === "ar" ? (
            <>قرمشة <span className="text-[#F58220]">أكثر.</span></>
          ) : (
            <>CRUNCH <span className="text-[#F58220]">HARD.</span></>
          )}
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="relative h-14 w-32">
              <Image
                src="/logo.png"
                alt={BRAND_NAME}
                fill
                className="object-contain object-left rtl:object-right"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/50 font-barlow-condensed tracking-wide uppercase">
              {locale === "fr" ? "Cuisine de rue d'inspiration Thaï. Tu aimes aujourd'hui, tu aimeras demain." : locale === "ar" ? "طعام شارع مستوحى من تايلاند. ستحبه اليوم وغداً." : "Thai-inspired street food. You love it today, you'll love it tomorrow."}
            </p>
          </div>

          <nav aria-label="Navigation">
            <h3 className="font-barlow-condensed text-[12px] font-bold tracking-[0.2em] uppercase text-[#F58220]">
              {locale === "fr" ? "NAVIGUER" : locale === "ar" ? "تصفح" : "NAVIGATE"}
            </h3>
            <ul className="mt-4 space-y-2 font-barlow-condensed text-lg uppercase font-semibold">
              <li>
                <Link href="/menu" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.menu}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link href="/location" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.location}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.faq}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="font-barlow-condensed text-[12px] font-bold tracking-[0.2em] uppercase text-[#F58220]">
              {locale === "fr" ? "COMPTE" : locale === "ar" ? "الحساب" : "ACCOUNT"}
            </h3>
            <ul className="mt-4 space-y-2 font-barlow-condensed text-lg uppercase font-semibold">
              <li>
                <Link href="/profile" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.profile}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.track}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white hover:text-[#F58220] transition-colors">
                  {t.nav.cart}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-barlow-condensed text-[12px] font-bold tracking-[0.2em] uppercase text-[#F58220]">
              {locale === "fr" ? "SUIVRE" : locale === "ar" ? "تابعنا" : "FOLLOW"}
            </h3>
            <div className="mt-4 flex gap-3">
              {[
                { 
                  label: "Instagram", 
                  url: "#", 
                  icon: (
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  )
                },
                { 
                  label: "Facebook", 
                  url: "#", 
                  icon: (
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.59-4H14V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  )
                },
                { 
                  label: "TikTok", 
                  url: "#", 
                  icon: (
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                    </svg>
                  )
                },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  aria-label={link.label}
                  className="flex items-center justify-center h-11 w-11 border-[2px] border-white/20 text-white hover:border-[#F58220] hover:text-[#F58220] transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {["EN", "FR", "AR"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l.toLowerCase() as Locale)}
                  className={cn(
                    "font-barlow-condensed text-[13px] font-bold px-3 py-1 border-[2px] transition-colors",
                    locale.toUpperCase() === l
                      ? "border-[#F58220] text-[#F58220]"
                      : "border-white/20 text-white hover:border-[#F58220] hover:text-[#F58220]"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 border-t-[2px] border-[#1a1a1a] pt-6 font-barlow-condensed text-xs uppercase tracking-[0.2em] text-white/40 pb-20 md:pb-0">
          © {currentYear} {BRAND_NAME} — {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
