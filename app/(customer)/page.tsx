"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  ChefHat, 
  Zap, 
  Star, 
  Quote, 
  ChevronDown,
  Timer,
  Utensils
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { GlassCard } from "@/components/glass/GlassCard";
import { getFeaturedProducts } from "@/lib/products/repository";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { t, locale } = useLocale();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    getFeaturedProducts(locale).then(setFeatured);
  }, [locale]);

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative min-h-[85dvh] flex items-center overflow-hidden rounded-[2.5rem] glass-premium group"
      >
        <Image
          src="/products/crousty-mix.png"
          alt="Premium Burger"
          fill
          className="object-cover object-center transition-transform duration-[2s] group-hover:scale-110"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />

        <div className="relative z-10 w-full max-w-3xl px-6 md:px-16 pt-20">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-primary border-primary/20"
          >
            <Sparkles className="h-4 w-4 glow-primary" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              {t.home.hero.premium}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black leading-[1] md:text-8xl text-gradient-white"
          >
            Taste the <br />
            <span className="text-gradient">{t.common.premium}.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-xl text-lg md:text-2xl text-muted/80 font-medium leading-relaxed"
          >
            {t.home.subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.4)] hover:scale-105 active:scale-95 transition-all">
              <Link href="/menu">
                {t.home.cta}
                <ArrowRight className={cn(locale === "ar" ? "mr-2 rotate-180" : "ml-2", "h-5 w-5")} />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="h-14 px-8 rounded-2xl font-bold backdrop-blur-xl border-white/10 hover:bg-white/5 transition-all">
              <Link href="/about">
                {t.home.hero.ourStory}
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Floating Decor */}
        <div className={cn("absolute bottom-10 hidden lg:block", locale === "ar" ? "left-10" : "right-10")}>
          <div className="glass rounded-3xl p-6 animate-float flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">{t.home.hero.fastDelivery}</p>
              <p className="text-lg font-black tracking-tighter">{t.home.hero.under30}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Section */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{t.home.featured}</h2>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>
          <Link href="/menu" className="group flex items-center gap-2 text-primary font-bold hover:scale-105 transition-transform">
            {t.menu.viewAll} <ArrowRight className={cn(locale === "ar" ? "mr-2 rotate-180" : "ml-2", "h-5 w-5 group-hover:translate-x-1 transition-transform")} />
          </Link>
        </div>
        <FeaturedCarousel products={featured} title="" />
      </section>

      {/* Why Us Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: ChefHat,
            title: t.home.whyUs.recipes.title,
            desc: t.home.whyUs.recipes.desc
          },
          {
            icon: Zap,
            title: t.home.whyUs.service.title,
            desc: t.home.whyUs.service.desc
          },
          {
            icon: Star,
            title: t.home.whyUs.quality.title,
            desc: t.home.whyUs.quality.desc
          }
        ].map((feature, i) => (
          <GlassCard 
            key={feature.title} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 flex flex-col gap-6 group hover:border-primary/20 transition-all duration-500"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <feature.icon className="h-8 w-8 text-primary glow-primary" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
            <p className="text-muted leading-relaxed font-medium">{feature.desc}</p>
          </GlassCard>
        ))}
      </section>

      {/* Testimonials */}
      <section className="relative py-20 overflow-hidden rounded-[2.5rem] glass-premium px-6 md:px-16 text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Utensils className="absolute top-10 left-10 h-32 w-32 -rotate-12" />
          <Utensils className="absolute bottom-10 right-10 h-32 w-32 rotate-12" />
        </div>
        
        <Quote className="h-16 w-16 text-primary/20 mx-auto mb-8" />
        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-12">{t.home.testimonials.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {t.home.testimonials.reviews.map((review, i) => (
            <GlassCard key={review.name} className="p-8 text-left border-white/5">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
              </div>
              <p className="text-lg font-medium italic mb-6 leading-relaxed">&quot;{review.text}&quot;</p>
              <p className="font-black text-primary uppercase tracking-widest text-xs">- {review.name}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto w-full">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12 text-center">{t.nav.faq}</h2>
        <div className="flex flex-col gap-4">
          {t.faq.questions.slice(0, 3).map((item, i) => (
            <GlassCard key={i} className="p-6 flex flex-col gap-2 cursor-pointer group hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">{item.q}</h3>
                <ChevronDown className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted text-sm leading-relaxed mt-2">{item.a}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
