"use client";

import Link from "next/link";
import { Flame, Camera, Share2, Phone, MessageCircle } from "lucide-react";
import { BRAND_NAME, BRAND_SUBTITLE, WHATSAPP_NUMBER } from "@/lib/constants";
import { useLocale } from "@/components/locale-provider";

export function Footer() {
  const { t } = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-white/5 glass-premium pt-16 pb-8 px-4 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl glass bg-primary/15">
                <Flame className="h-6 w-6 text-primary glow-primary" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-gradient">{BRAND_NAME}</span>
                <span className="text-[10px] text-muted uppercase tracking-[0.2em]">{BRAND_SUBTITLE}</span>
              </div>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              {t.footer.brandDesc}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg glass hover:text-primary transition-colors">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg glass hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="p-2 rounded-lg glass hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-foreground/90 uppercase tracking-widest text-xs">{t.nav.menu}</h4>
            <ul className="flex flex-col gap-4 text-sm text-muted">
              <li><Link href="/" className="hover:text-primary transition-colors">{t.nav.home}</Link></li>
              <li><Link href="/menu" className="hover:text-primary transition-colors">{t.nav.menu}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">{t.nav.about}</Link></li>
              <li><Link href="/location" className="hover:text-primary transition-colors">{t.nav.location}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-6 text-foreground/90 uppercase tracking-widest text-xs">{t.footer.support}</h4>
            <ul className="flex flex-col gap-4 text-sm text-muted">
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t.nav.contact}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">{t.nav.faq}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{t.footer.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t.footer.terms}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-6 text-foreground/90 uppercase tracking-widest text-xs">{t.footer.visit}</h4>
            <ul className="flex flex-col gap-4 text-sm text-muted">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+213 555 123 456</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                <span>WhatsApp: {WHATSAPP_NUMBER}</span>
              </li>
              <li className="flex items-start gap-3 leading-relaxed">
                <div className="h-4 w-4 shrink-0" />
                <span>Rue 11 Decembre 1960,<br />Dely Ibrahim, Algiers</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted font-medium">
          <p>© {currentYear} {BRAND_NAME}. {t.footer.rights}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              {t.footer.open}
            </span>
            <span>{t.footer.handcrafted}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
