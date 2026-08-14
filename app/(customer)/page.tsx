"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, Timer, Truck, Plus, Minus } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { getFeaturedProducts } from "@/lib/products/repository";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
/* ── CONSTANTS & ASSETS ── */
const ORANGE = "#F58220";
const BLACK = "#0A0A0A";
const DEFAULT_IMG = "/products/crousty-mix.png";

const getHomeFaqs = (locale: string) => {
  if (locale === "fr") return [
    ["Livrez-vous ?", "Oui — chaud et croustillant à votre porte dans toute la ville, 7j/7."],
    ["À quel point est-ce épicé ?", "Notre sauce piquante frappe fort mais reste mangeable. Demandez un supplément si vous l'osez."],
    ["Puis-je personnaliser mon bol ?", "Chaque bol vous permet de choisir vos sauces et votre niveau de croquant au niveau du produit."],
    ["Prenez-vous la carte ?", "La carte et l'espèce à la livraison sont acceptées à la caisse."],
  ];
  if (locale === "ar") return [
    ["هل تقومون بالتوصيل؟", "نعم — ساخن ومقرمش إلى باب منزلك في جميع أنحاء المدينة، 7 أيام في الأسبوع."],
    ["ما مدى حرارة الصلصة الحارة؟", "صلصتنا الحارة قوية ولكنها لذيذة. اطلب المزيد إذا كنت تجرؤ."],
    ["هل يمكنني تخصيص وعائي؟", "يتيح لك كل وعاء اختيار الصلصات ومستوى القرمشة."],
    ["هل تقبلون الدفع بالبطاقة؟", "يتم دعم الدفع بالبطاقة والنقد عند الاستلام عند الدفع."],
  ];
  return [
    ["Do you deliver?", "Yes — hot and crispy to your door across the city, 7 days a week."],
    ["How spicy is spicy?", "Our spicy sauce hits hard but stays eatable. Ask for extra if you dare."],
    ["Can I customize a bowl?", "Every bowl lets you pick sauces and crunch level at product level."],
    ["Do you take card?", "Card and cash on delivery are both supported at checkout."],
  ];
};

function Grain({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

const MARQUEE_ITEMS: Record<string, string[]> = {
  en: ["CROUSTY CLASSIC", "★", "THAI STREET FOOD", "★", "BOLD FLAVORS", "★", "YOU LOVE IT TODAY", "★", "YOU'LL LOVE IT TOMORROW", "★", "NO COMPROMISE", "★"],
  fr: ["CROUSTY CLASSIQUE", "★", "CUISINE DE RUE THAÏ", "★", "SAVEURS AUDACIEUSES", "★", "TU AIMES AUJOURD'HUI", "★", "TU AIMERAS DEMAIN", "★", "SANS COMPROMIS", "★"],
  ar: ["كروستي كلاسيك", "★", "طعام شوارع تايلندي", "★", "نكهات جريئة", "★", "تحبها اليوم", "★", "ستحبها غداً", "★", "بلا تنازل", "★"],
};

function Marquee({ words }: { words: string[] }) {
  const { locale } = useLocale();
  const items = MARQUEE_ITEMS[locale] || MARQUEE_ITEMS.en;
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="bg-[#F58220] overflow-hidden py-3 border-y-[3px] border-[#0a0a0a] relative z-10">
      <div className="marquee-track font-anton text-[22px] md:text-[28px] text-[#0a0a0a] flex">
        {repeated.map((item, i) => (
          <span key={i} className="whitespace-nowrap pe-[40px] md:pe-[60px]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}


export default function HomePage() {
  const { t, locale } = useLocale();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  useEffect(() => {
    getFeaturedProducts(locale).then(setFeatured);
  }, [locale]);

  const heroProduct = featured[0] || { price: 10.9, image_url: DEFAULT_IMG };
  const bestProducts = featured.slice(0, 4);

  return (
    <main className="w-full bg-[#0a0a0a] min-h-screen overflow-x-hidden pt-[68px]">
      
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO (Lovable Layout + Figma Styling) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP HERO */}
      <section className="relative hidden md:grid min-h-[calc(100vh-68px)] grid-cols-[52%_48%] overflow-hidden bg-[#0a0a0a]">
        <Grain opacity={0.08} />
        <div aria-hidden="true" className="absolute -bottom-[30px] -start-[20px] z-0 font-anton text-[clamp(200px,28vw,440px)] leading-none text-white/5 whitespace-nowrap pointer-events-none select-none">THAI</div>
        <div aria-hidden="true" className="halftone absolute bottom-0 end-0 h-[40%] w-[45%] z-[1] pointer-events-none opacity-70" />
        <div aria-hidden="true" className="absolute top-[12%] -end-[80px] h-[280px] w-[280px] rounded-full border-[14px] border-[#F58220] z-[2] pointer-events-none opacity-20" />

        <div className="relative z-10 flex flex-col justify-center px-[40px] ps-[64px] py-[80px]">
          <div className="font-barlow-condensed text-[#F58220] text-[11px] font-bold tracking-[0.28em] uppercase mb-[22px]">
            {t.home.hero.kicker}
          </div>
          <div className="relative">
            <div className="font-anton text-[clamp(96px,13.5vw,210px)] leading-[0.86] text-white block">THAISTY</div>
            <div className="font-anton text-[clamp(78px,11vw,172px)] leading-[0.86] text-[#F58220] block mt-2">CROUSTY</div>
          </div>
          <div className="w-[60px] h-[2px] bg-[#F58220] mt-[28px] mb-[20px]" />
          <div className="font-barlow-condensed text-[13px] font-normal text-white/40 tracking-[0.18em] uppercase mb-[44px]">
            {t.home.hero.ingredients}
          </div>
          
          <div className="flex items-center gap-[24px] flex-wrap">
            <Link href="/menu" className="font-barlow-condensed bg-[#F58220] text-[#0a0a0a] px-[48px] py-[18px] text-[17px] font-bold tracking-[0.1em] uppercase hover:bg-white transition-colors">
              {t.home.cta}
            </Link>
            <div className="relative w-[80px] h-[80px] shrink-0">
              <svg viewBox="0 0 80 80" className="absolute inset-0 spin-sticker">
                <defs><path id="ct" d="M40,40 m-27,0 a27,27 0 1,1 54,0 a27,27 0 1,1,-54,0" /></defs>
                <circle cx="40" cy="40" r="37" fill="#F58220" />
                <text className="font-barlow-condensed text-[8px] font-bold tracking-[0.2em]" fill="#0a0a0a" textAnchor="middle"><textPath href="#ct">{t.home.hero.sticker}</textPath></text>
                <text x="40" y="45" textAnchor="middle" fontSize="20" fill="#0a0a0a">🔥</text>
              </svg>
            </div>
          </div>
          <div className="float-sticker absolute bottom-[64px] start-[64px] z-15 font-barlow-condensed bg-white text-[#0a0a0a] px-[18px] py-[7px] text-[10px] font-bold tracking-[0.22em] uppercase">
            {t.home.hero.floating}
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#0e0e0e]">
          <div className="absolute inset-0 -start-[8%] overflow-hidden">
            <img src="/figma-assets/crousty-bowl.jpg" alt="Crousty Classic bowl" className="w-[108%] h-[115%] object-cover object-[center_18%] block rtl:-scale-x-100" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_0%,rgba(10,10,10,0.7)_40%,transparent_100%)] rtl:bg-[linear-gradient(to_left,#0a0a0a_0%,rgba(10,10,10,0.7)_40%,transparent_100%)] z-[2]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#0a0a0a_0%,transparent_100%)] h-[28%] mt-auto z-[2]" />
          <div className="absolute top-[36px] inset-x-0 text-center z-[4] pointer-events-none">
            <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.45em] text-white/45 uppercase mb-1">C R O U S T Y</div>
            <div className="font-anton text-[52px] text-white leading-[0.9]">{t.home.hero.classic}</div>
          </div>
          <div className="float-sticker-r absolute bottom-[90px] end-[28px] z-[6] font-barlow-condensed bg-[#F58220] text-[#0a0a0a] px-[18px] py-[8px] text-[11px] font-bold tracking-[0.18em] uppercase">
            {t.home.hero.spirit}
          </div>
        </div>
        
        <div aria-hidden="true" className="absolute top-1/2 start-[51%] -translate-x-1/2 -translate-y-1/2 rotate-90 font-barlow-condensed text-[9px] font-bold tracking-[0.45em] uppercase text-white/10 whitespace-nowrap z-[9] pointer-events-none">{t.home.hero.sideLabel}</div>
      </section>

      {/* MOBILE HERO */}
      <section className="relative md:hidden h-[100svh] min-h-[580px] overflow-hidden bg-[#0e0e0e]">
        <img src="/figma-assets/crousty-bowl.jpg" alt="Crousty Classic" className="absolute inset-0 w-full h-full object-cover object-[center_15%] rtl:-scale-x-100" />
        <Grain opacity={0.09} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.88)_0%,rgba(10,10,10,0.4)_35%,rgba(10,10,10,0.15)_55%,rgba(10,10,10,0.7)_80%,rgba(10,10,10,0.97)_100%)] z-[1]" />
        <div aria-hidden="true" className="halftone absolute top-0 end-0 w-[40%] h-[35%] opacity-50 pointer-events-none z-[2]" />

        <motion.div 
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-[6] pointer-events-none"
        >
          <div className="absolute top-[72px] inset-x-[20px]">
            <div className="font-barlow-condensed text-[#F58220] text-[10px] font-bold tracking-[0.3em] uppercase mb-[6px]">
              {t.home.hero.kicker}
            </div>
            <div className="font-anton leading-[0.86]">
              <div className="text-[clamp(72px,22vw,130px)] text-white">THAISTY</div>
              <div className="relative h-0 overflow-visible mt-[2px]">
                <svg viewBox="0 0 100 20" className="absolute w-[80%] -left-[2%] opacity-30 text-[#F58220]" fill="currentColor">
                  <path d="M5,10 C20,15 50,5 95,12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[clamp(56px,17vw,100px)] text-[#F58220] mt-[6px]">CROUSTY</div>
            </div>
          </div>
  
          <div className="absolute top-[80px] end-[20px] m-float pointer-events-auto">
            <svg viewBox="0 0 72 72" className="w-[68px] h-[68px] spin-sticker">
              <defs><path id="mct" d="M36,36 m-24,0 a24,24 0 1,1 48,0 a24,24 0 1,1,-48,0" /></defs>
              <circle cx="36" cy="36" r="34" fill="#F58220" />
              <text className="font-barlow-condensed text-[7.5px] font-bold tracking-[0.18em]" fill="#0a0a0a" textAnchor="middle"><textPath href="#mct">{t.home.hero.sticker}</textPath></text>
              <text x="36" y="41" textAnchor="middle" fontSize="18" fill="#0a0a0a">🔥</text>
            </svg>
          </div>
          
          <div className="absolute bottom-[40px] inset-x-[20px] flex flex-col gap-4 pointer-events-auto">
            <Link href="/menu" className="font-barlow-condensed bg-[#F58220] text-[#0a0a0a] w-full text-center py-[16px] text-[16px] font-bold tracking-[0.1em] uppercase border border-[#0a0a0a]">
              {t.home.cta}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2. MARQUEE */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#F58220] overflow-hidden py-3.5 border-y-[3px] border-[#0a0a0a] relative z-10 w-full whitespace-nowrap">
        <div className="marquee-track font-anton text-[19px] text-[#0a0a0a]">
          {[...(MARQUEE_ITEMS[locale] || MARQUEE_ITEMS.en), ...(MARQUEE_ITEMS[locale] || MARQUEE_ITEMS.en), ...(MARQUEE_ITEMS[locale] || MARQUEE_ITEMS.en), ...(MARQUEE_ITEMS[locale] || MARQUEE_ITEMS.en)].map((item, i) => (
            <span key={i} className="px-5">{item}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2.5 THE BOWL DROP (DESKTOP ONLY) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden md:block relative overflow-hidden bg-[#0a0a0a] px-[64px] py-[110px]">
        <Grain opacity={0.055} />
        <div aria-hidden="true" className="font-anton absolute top-1/2 -end-[60px] -translate-y-1/2 text-[clamp(180px,24vw,360px)] leading-none text-white/5 pointer-events-none select-none z-[1]">BOWL</div>
        <div className="relative z-[2] mx-auto w-full grid grid-cols-2 gap-[80px] items-center">
          <motion.div
            initial={{ opacity: 0, x: locale === "ar" ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative group"
          >
            <div className="absolute -top-[18px] -start-[18px] end-[48px] bottom-[48px] border-[3px] border-[#F58220] z-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            <img src="/figma-assets/crousty-bowl.jpg" alt="Crousty Classic bowl close-up" className="relative z-[1] block w-full aspect-[4/5] object-cover object-[center_20%] transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 rtl:-scale-x-100" />
            <div className="absolute -top-[20px] end-[28px] z-[5] transition-transform duration-500 group-hover:-translate-y-4">
              <svg viewBox="0 0 72 72" width="72" height="72" className="animate-[spin_10s_linear_infinite] opacity-95">
                <defs><path id="sc2" d="M36,36 m-22,0 a22,22 0 1,1 44,0 a22,22 0 1,1,-44,0" /></defs>
                <circle cx="36" cy="36" r="34" fill="#fff" />
                <text className="font-barlow-condensed text-[7px] font-bold tracking-[0.2em]" fill="#0a0a0a" textAnchor="middle"><textPath href="#sc2">{t.home.bowlDrop.bestseller}</textPath></text>
                <text x="36" y="40" textAnchor="middle" className="font-anton text-[12px]" fill="#0a0a0a">{t.home.bowlDrop.number1}</text>
              </svg>
            </div>
            <div className="float-sticker-r absolute bottom-[60px] -end-[20px] z-[4] font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase bg-white text-[#0a0a0a] px-[16px] py-[7px]">★ {t.home.bowlDrop.fanFavorite}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="font-barlow-condensed text-[#F58220] text-[11px] font-bold tracking-[0.3em] uppercase mb-[16px]">{t.home.bowlDrop.signature}</div>
            <div className="font-anton text-[clamp(56px,7.5vw,112px)] leading-[0.88] text-white mb-[28px]">{t.home.bowlDrop.title1}<br />{t.home.bowlDrop.title2}<br /><span className="text-[#F58220]">{t.home.bowlDrop.title3}</span></div>
            <div className="border-t border-[#1f1f1f] pt-[24px] mb-[40px]">
              {t.home.bowlDrop.ingredients.map((ing: string, i: number) => (
                <div key={i} className="flex items-center gap-[14px] py-[10px] border-b border-[#181818] font-barlow-condensed text-[14px] font-semibold tracking-[0.08em] uppercase text-white/45">
                  <span className="text-[#F58220] text-[8px] rtl:-scale-x-100">■</span>{ing}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[28px]">
              <Link href="/menu" className="font-barlow-condensed bg-transparent text-[#F58220] border-[2px] border-[#F58220] px-[36px] py-[14px] text-[15px] font-bold tracking-[0.12em] uppercase hover:bg-[#F58220] hover:text-[#0a0a0a] hover:scale-105 transition-all duration-300">{t.home.cta}</Link>
              <div className="font-anton text-[28px] text-white/20">10.90€</div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 3. POPULAR PICKS */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full px-[20px] py-[64px] md:px-[64px] md:py-[100px]">
        <Grain opacity={0.04} />
        
        <div className="flex flex-wrap items-end justify-between gap-4 relative z-10">
          <h2 className="font-anton text-[13vw] leading-[0.8] md:text-[6vw] text-white">
            {t.home.popular.title1} <span className="text-[#F58220]">{t.home.popular.title2}</span>
          </h2>
          <Link href="/menu" className="font-barlow-condensed text-[#F58220] text-[14px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center gap-2">
            {t.home.popular.seeAll} <span className="rtl:-scale-x-100">→</span>
          </Link>
        </div>

        <div className="mt-10 relative z-10 w-full">
          <FeaturedCarousel products={bestProducts} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 3.5 WHY THAISTY */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative border-t-[3px] border-[#0a0a0a] bg-[#0a0a0a] px-[20px] py-[64px] md:px-[64px] md:py-[100px] w-full">
        <Grain opacity={0.03} />
        <div className="mx-auto w-full relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-anton text-[clamp(44px,8vw,96px)] text-center text-white mb-8 md:mb-16 uppercase relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          >
            {t.home.whyUs.title1} <span className="text-transparent" style={{ WebkitTextStroke: "2px #F58220" }}>{t.home.whyUs.title2}</span>
          </motion.h2>
          <div className="mt-10 grid gap-[3px] border-[3px] border-[#F58220] bg-[#F58220] md:grid-cols-3">
            {[
              [Flame, t.home.whyUs.card1Title, t.home.whyUs.card1Desc],
              [Timer, t.home.whyUs.card2Title, t.home.whyUs.card2Desc],
              [Truck, t.home.whyUs.card3Title, t.home.whyUs.card3Desc],
            ].map(([Icon, title, text], idx) => {
              const I = Icon as typeof Flame;
              return (
                <motion.div 
                  key={title as string} 
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#111] p-8 md:p-10 flex flex-col items-start transition-all"
                >
                  <div className="p-3 bg-[#F58220]/10 border border-[#F58220]/30 rounded-none mb-4">
                    <I className="h-10 w-10 text-[#F58220]" />
                  </div>
                  <h3 className="mt-4 font-anton text-[32px] leading-tight text-white">{title as string}</h3>
                  <p className="mt-4 font-barlow-condensed text-[18px] font-bold uppercase tracking-[0.06em] text-white/50">{text as string}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 4. MANIFESTO */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP MANIFESTO */}
      <section className="hidden md:block relative overflow-hidden bg-[#F58220] px-[64px] py-[72px]">
        <Grain opacity={0.04} />
        <div aria-hidden="true" className="halftone absolute top-0 end-0 w-[30%] h-full opacity-45 pointer-events-none z-0 rtl:-scale-x-100" />
        <div aria-hidden="true" className="font-anton absolute -bottom-[20px] -end-[20px] text-[clamp(80px,14vw,220px)] leading-none text-[rgba(10,10,10,0.06)] pointer-events-none select-none z-0">FIRE</div>
        
        <div className="relative z-10 mx-auto w-full grid grid-cols-[1fr_auto] items-center gap-[48px]">
          <div>
            <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.3em] uppercase text-[rgba(10,10,10,0.45)] mb-[18px]">
              {t.home.manifesto.label}
            </div>
            <div className="font-anton text-[clamp(44px,7vw,108px)] leading-[0.9] text-[#0a0a0a]">
              {t.home.manifesto.title1}<br />{t.home.manifesto.title2}<br />{t.home.manifesto.title3}<br />{t.home.manifesto.title4}
            </div>
          </div>
          <div className="flex flex-col items-center gap-[12px] shrink-0">
            <div className="w-[1px] h-[80px] bg-[rgba(10,10,10,0.2)]" />
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.18em] uppercase text-[rgba(10,10,10,0.5)] [writing-mode:vertical-rl]">
              {t.home.manifesto.sideLabel}
            </div>
            <div className="w-[1px] h-[80px] bg-[rgba(10,10,10,0.2)]" />
          </div>
        </div>
      </section>

      {/* MOBILE MANIFESTO */}
      <section className="md:hidden relative overflow-hidden bg-[#F58220] px-[20px] py-[44px]">
        <Grain opacity={0.04} />
        <div aria-hidden="true" className="halftone absolute top-0 end-0 w-[35%] h-full opacity-40 pointer-events-none z-0 rtl:-scale-x-100" />
        
        <div className="relative z-[2]">
          <div className="font-barlow-condensed text-[9px] font-bold tracking-[0.3em] uppercase text-[rgba(10,10,10,0.45)] mb-[14px]">
            {t.home.manifesto.label}
          </div>
          <div className="font-anton text-[clamp(36px,11vw,60px)] leading-[0.9] text-[#0a0a0a] mb-[18px]">
            {t.home.manifesto.title1}<br />{t.home.manifesto.title2}<br />{t.home.manifesto.title3}<br />{t.home.manifesto.title4}
          </div>
          <div className="font-barlow-condensed text-[12px] font-bold tracking-[0.14em] uppercase text-[rgba(10,10,10,0.5)]">
            {t.home.manifesto.sideLabel}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 5. THE BOWL DROP (MOBILE ONLY) - MOVED HERE */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="md:hidden relative overflow-hidden bg-[#0a0a0a] px-5 py-14 border-t-[3px] border-[#0a0a0a]">
        <Grain opacity={0.055} />
        <div aria-hidden="true" className="font-anton absolute top-[15%] -end-[20px] text-[150px] leading-none text-white/5 pointer-events-none select-none z-[1]">BOWL</div>
        <div className="relative z-[2] mx-auto w-full flex flex-col gap-12">
          <div className="relative">
            <div className="absolute -top-[12px] -start-[12px] end-[24px] bottom-[24px] border-[3px] border-[#F58220] z-0" />
            <img src="/figma-assets/crousty-bowl.jpg" alt="Crousty Classic bowl close-up" className="relative z-[1] block w-full aspect-[4/5] object-cover object-[center_20%] rtl:-scale-x-100" />
            <div className="absolute -top-[16px] end-[10px] z-[5]">
              <svg viewBox="0 0 72 72" width="60" height="60" className="animate-[spin_10s_linear_infinite] opacity-95">
                <defs><path id="sc2_mob" d="M36,36 m-22,0 a22,22 0 1,1 44,0 a22,22 0 1,1,-44,0" /></defs>
                <circle cx="36" cy="36" r="34" fill="#fff" />
                <text className="font-barlow-condensed text-[7px] font-bold tracking-[0.2em]" fill="#0a0a0a" textAnchor="middle"><textPath href="#sc2_mob">{t.home.bowlDrop.bestseller}</textPath></text>
                <text x="36" y="41" textAnchor="middle" className="font-anton text-[13px]" fill="#0a0a0a">{t.home.bowlDrop.number1}</text>
              </svg>
            </div>
            <div className="absolute bottom-[30px] -end-[10px] z-[4] font-barlow-condensed text-[9px] font-bold tracking-[0.2em] uppercase bg-white text-[#0a0a0a] px-[12px] py-[6px]">★ {t.home.bowlDrop.fanFavorite}</div>
          </div>
          <div>
            <div className="font-barlow-condensed text-[#F58220] text-[10px] font-bold tracking-[0.3em] uppercase mb-[12px]">{t.home.bowlDrop.signature}</div>
            <div className="font-anton text-[clamp(44px,14vw,64px)] leading-[0.88] text-white mb-[24px]">{t.home.bowlDrop.title1}<br />{t.home.bowlDrop.title2}<br /><span className="text-[#F58220]">{t.home.bowlDrop.title3}</span></div>
            <div className="border-t border-[#1f1f1f] pt-[20px] mb-[32px]">
              {t.home.bowlDrop.ingredients.map((ing: string, i: number) => (
                <div key={i} className="flex items-center gap-[12px] py-[8px] border-b border-[#181818] font-barlow-condensed text-[12px] font-semibold tracking-[0.08em] uppercase text-white/45">
                  <span className="text-[#F58220] text-[6px] rtl:-scale-x-100">■</span>{ing}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[24px]">
              <Link href="/menu" className="flex-1 text-center font-barlow-condensed bg-transparent text-[#F58220] border-[2px] border-[#F58220] px-[24px] py-[12px] text-[14px] font-bold tracking-[0.12em] uppercase hover:bg-[#F58220] hover:text-[#0a0a0a] transition-all duration-200">{t.home.cta}</Link>
              <div className="font-anton text-[24px] text-white/20 shrink-0">10.90€</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 6. TESTIMONIALS */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full px-[20px] py-[64px] md:px-[64px] md:py-[100px]">
        <Grain opacity={0.03} />
        
        <h2 className="font-anton text-[13vw] leading-[0.8] md:text-[6vw] text-white">
          {t.home.testimonials.title1} <span className="text-[#F58220]">{t.home.testimonials.title2}</span> {t.home.testimonials.title3}
        </h2>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {(locale === "ar" ? [
            ["“أفضل قرمشة في المدينة. طلبت مرتين في ليلة واحدة.”", "— ياسين", "-rotate-2"],
            ["“خلطة الكاري خيالية. بكل صدق.”", "— سارة", "rotate-1"],
            ["“وصل ساخن، ولسا مقرمش. احترام.”", "— مهدي", "-rotate-1"],
          ] : locale === "fr" ? [
            ["“Le meilleur croquant en ville. J'ai commandé deux fois en une soirée.”", "— YACINE", "-rotate-2"],
            ["“Le mix curry est illégal. Sérieusement.”", "— SARAH", "rotate-1"],
            ["“Arrivé chaud, encore croustillant. Respect.”", "— MEHDI", "-rotate-1"],
          ] : [
            ["“Best crunch in town. I ordered twice in one night.”", "— YACINE", "-rotate-2"],
            ["“The curry mix is illegal. Genuinely.”", "— SARAH", "rotate-1"],
            ["“Arrived hot, still crispy. Respect.”", "— MEHDI", "-rotate-1"],
          ]).map(([quote, who, rot], idx) => (
            <motion.figure 
              key={who} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.03, rotate: 0 }}
              className={`bg-white border-[3px] border-white p-8 ${rot} relative cursor-default shadow-lg transition-shadow hover:shadow-2xl`}
            >
              <span className="font-anton block text-[64px] leading-none text-[#F58220] absolute -top-4 start-6 rtl:-scale-x-100">“</span>
              <blockquote className="mt-6 font-barlow-condensed text-[20px] md:text-[24px] text-[#0a0a0a] font-bold uppercase leading-tight tracking-wide">
                {quote}
              </blockquote>
              <figcaption className="mt-6 font-barlow-condensed text-[12px] font-bold tracking-[0.2em] text-[#F58220] uppercase">{who}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 7. FAQ */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="border-t-[3px] border-[#1a1a1a] bg-[#0a0a0a] px-[20px] py-[64px] md:px-[64px] md:py-[100px] relative w-full">
        <Grain opacity={0.03} />
        
        <div className="mx-auto w-full relative z-10">
          <h2 className="font-anton text-[48px] md:text-[72px] text-white">{t.home.faqSection.title}</h2>
          
          <div className="mt-8 divide-y-[2px] divide-[#1a1a1a] border-y-[2px] border-[#1a1a1a]">
            {getHomeFaqs(locale).map(([q, a], i) => {
              const isOpen = openFaq === i;
              return (
                <div key={q} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-6 text-left group transition-colors"
                  >
                    <span className={`font-barlow-condensed text-[20px] md:text-[24px] font-bold uppercase tracking-wide transition-colors ${isOpen ? "text-[#F58220]" : "text-white group-hover:text-[#F58220]"}`}>{q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isOpen ? (
                        <Minus className="h-6 w-6 shrink-0 text-[#F58220]" />
                      ) : (
                        <Plus className="h-6 w-6 shrink-0 text-white group-hover:text-[#F58220] transition-colors" />
                      )}
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <p className="pb-6 font-barlow-condensed text-[16px] uppercase tracking-wide text-white/50">{a}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
          
          <p className="mt-10 font-barlow-condensed text-[14px] uppercase tracking-wider text-white/50">
            {t.home.faqSection.stillStuck} <Link href="/contact" className="text-[#F58220] underline underline-offset-4 hover:text-white transition-colors">{t.home.faqSection.contactUs}</Link> —
            {t.home.faqSection.bowlsStart} {(heroProduct.discount_price ?? heroProduct.price).toFixed(2)}€.
          </p>
        </div>
      </section>

    </main>
  );
}
