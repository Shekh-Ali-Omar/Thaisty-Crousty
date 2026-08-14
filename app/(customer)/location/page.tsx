"use client";

import { MapPin, Clock, Navigation } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function LocationPage() {
  const { t, locale } = useLocale();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="t-grain border-b-2 border-[#F58220] bg-[#0a0a0a] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full">
          <p className="t-kicker text-[#F58220]">
            {locale === "ar" ? "تفضل بزيارتنا" : locale === "fr" ? "VENEZ NOUS VOIR" : "COME THROUGH"}
          </p>
          <h1 className="t-display mt-3 text-[15vw] leading-[0.78] md:text-[9vw] text-white">
            {locale === "ar" ? (<>أين <span className="text-[#F58220]">نحن.</span></>) : locale === "fr" ? (<>TROUVEZ- <span className="text-[#F58220]">NOUS.</span></>) : (<>FIND <span className="text-[#F58220]">US.</span></>)}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid w-full gap-8 px-4 py-12 md:grid-cols-[1fr_1.2fr] md:px-8">
        <div className="space-y-6">
          <div className="t-panel p-5">
            <span className="t-kicker text-white/50">
              {locale === "ar" ? "العنوان" : locale === "fr" ? "ADRESSE" : "ADDRESS"}
            </span>
            <p className="mt-2 flex items-start gap-3 font-barlow-condensed font-bold text-2xl uppercase text-white leading-tight">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-[#F58220]" />
              {t.contact?.locationVal || "12 Rue du Crunch, Centre Ville"}
            </p>
          </div>

          <div className="t-panel p-5">
            <span className="t-kicker text-white/50">
              {locale === "ar" ? "ساعات العمل" : locale === "fr" ? "HORAIRES" : "HOURS"}
            </span>
            <p className="mt-2 flex items-center gap-3 font-barlow-condensed font-bold text-2xl uppercase text-white leading-tight">
              <Clock className="h-6 w-6 shrink-0 text-[#F58220]" />
              {locale === "ar" ? "11:00 — 23:30 · كل يوم" : locale === "fr" ? "11:00 — 23:30 · TOUS LES JOURS" : "11:00 — 23:30 · EVERY DAY"}
            </p>
            <div className="mt-4">
              <span className="t-sticker-acid">{locale === "ar" ? "مفتوح الآن" : locale === "fr" ? "OUVERT" : "OPEN NOW"}</span>
            </div>
          </div>

          <a
            href="https://maps.google.com"
            className="t-btn w-full text-xl"
            target="_blank"
            rel="noreferrer"
          >
            <Navigation className="h-5 w-5" /> {locale === "ar" ? "احصل على الاتجاهات" : locale === "fr" ? "ITINÉRAIRE" : "GET DIRECTIONS"}
          </a>
        </div>

        <div className="min-h-[400px] border-2 border-[#1a1a1a] bg-[#111] relative">
          <div className="absolute inset-0 bg-[#0a0a0a]/50 flex items-center justify-center z-0 pointer-events-none">
             <span className="t-kicker text-white/20">{locale === "ar" ? "جاري تحميل الخريطة..." : locale === "fr" ? "CHARGEMENT..." : "LOADING MAP..."}</span>
          </div>
          <iframe
            title="Thaisty Crousty location map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=3.03%2C36.74%2C3.10%2C36.78&layer=mapnik"
            className="h-full min-h-[400px] w-full grayscale relative z-10 mix-blend-luminosity opacity-80"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
