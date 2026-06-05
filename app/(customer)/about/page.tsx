"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChefHat, History, Heart, Award, Users, Utensils, Star, Smile } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { GlassCard } from "@/components/glass/GlassCard";

export default function AboutPage() {
  const { t } = useLocale();

  const stats = [
    { label: "Happy Fans", value: "50k+", icon: Smile },
    { label: "Secret Spices", value: "12+", icon: Utensils },
    { label: "Artisanal Recipes", value: "24", icon: Star },
    { label: "Elite Chefs", value: "6", icon: Users },
  ];

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-primary mb-8 border border-primary/20"
        >
          <History className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.about.legacy}</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-gradient mb-8 leading-[0.9]"
        >
          {t.about.title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-2xl text-muted/80 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          {t.about.desc}
        </motion.p>
      </section>

      {/* Grid Presentation */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="md:col-span-7 relative rounded-[3rem] overflow-hidden glass-premium h-[400px] md:h-full group"
        >
          <Image 
            src="/products/crousty-mix.png" 
            alt="Thaisty Crousty Premium" 
            fill 
            className="object-cover transition-transform duration-[3s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">{t.about.recipe.title}</h2>
            <p className="text-muted/90 text-lg font-medium">{t.about.recipe.desc}</p>
          </div>
        </motion.div>

        <div className="md:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative flex-1 rounded-[3rem] overflow-hidden glass group"
          >
            <Image 
              src="/products/creme-brulee.png" 
              alt="Artisanal Quality" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-12 text-center">
              <p className="text-2xl font-black italic leading-tight text-primary shadow-2xl">
                &quot;{t.about.quote}&quot;
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex-1 rounded-[3rem] overflow-hidden glass group h-[300px] md:h-auto"
          >
            <Image 
              src="/products/crousty-curry-thai.png" 
              alt="Elite Ingredients" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-black tracking-tight text-white">{t.about.ingredients.title}</h3>
              <p className="text-muted/90 text-sm font-medium">{t.about.ingredients.desc}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <GlassCard 
            key={i} 
            className="p-8 md:p-10 text-center flex flex-col items-center gap-4 group hover:border-primary/40 transition-all border-white/5"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <stat.icon className="h-7 w-7 text-primary glow-primary" />
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-1">{stat.value}</p>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted">{stat.label}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Values Section */}
      <section className="flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Our Elite Values</h2>
          <div className="h-1.5 w-24 bg-primary rounded-full mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Heart,
              title: t.about.values.love.title,
              desc: t.about.values.love.desc
            },
            {
              icon: Award,
              title: t.about.values.premium.title,
              desc: t.about.values.premium.desc
            },
            {
              icon: ChefHat,
              title: t.about.values.vision.title,
              desc: t.about.values.vision.desc
            }
          ].map((value, i) => (
            <GlassCard 
              key={i} 
              className="p-10 flex flex-col items-center text-center gap-6 group hover:border-primary/30 transition-all duration-500 rounded-[2.5rem]"
            >
              <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                <value.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{value.title}</h3>
              <p className="text-muted leading-relaxed font-medium">{value.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 rounded-[4rem] overflow-hidden glass-premium text-center px-6">
        <Image 
          src="/products/crousty-mix.png" 
          alt="CTA background" 
          fill 
          className="object-cover opacity-10 scale-125 rotate-12 blur-3xl pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center gap-10">
          <h2 className="text-5xl md:text-8xl font-black tracking-tight text-gradient leading-[0.9]">{t.about.cta.title}</h2>
          <p className="text-muted/80 max-w-2xl text-xl font-medium leading-relaxed">
            {t.about.cta.desc}
          </p>
          <a 
            href="/menu" 
            className="h-20 px-16 rounded-[2rem] bg-primary text-black font-black text-xl flex items-center justify-center shadow-[0_15px_60px_rgba(255,140,0,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            {t.about.cta.button}
          </a>
        </div>
      </section>
    </div>
  );
}
