"use client";

import { motion } from "framer-motion";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Camera, 
  Share2,
  Send,
  Clock,
  Mail
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const { t, locale } = useLocale();

  const socialLinks = [
    { icon: Camera, label: t.common.instagram, value: "@thaistycrousty", color: "text-pink-500" },
    { icon: Share2, label: t.common.facebook, value: "Thaisty Crousty", color: "text-blue-500" },
    { icon: MessageCircle, label: t.contact.whatsapp, value: WHATSAPP_NUMBER, color: "text-green-500" },
    { icon: Phone, label: t.contact.callUs, value: "+213 555 123 456", color: "text-primary" },
  ];

  return (
    <div className="flex flex-col gap-12 md:gap-24 pb-20 overflow-hidden">
      {/* Header Section */}
      <section className="text-center max-w-3xl mx-auto pt-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-primary mb-8 border border-primary/20"
        >
          <Mail className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.nav.contact}</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-gradient mb-8 leading-[0.9]"
        >
          {t.contact.title}
        </motion.h1>
        
        <p className="text-muted/80 text-lg md:text-2xl font-medium leading-relaxed">
          {t.contact.subtitle}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 px-4">
        {/* Contact Info & Socials (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">{t.contact.direct_channels}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialLinks.map((social, i) => (
                <GlassCard key={i} className="p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all border-white/5">
                  <div className={cn("h-12 w-12 rounded-xl bg-background/5 flex items-center justify-center transition-transform group-hover:scale-110", social.color)}>
                    <social.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{social.label}</p>
                    <p className="font-bold text-sm md:text-base whitespace-nowrap" dir="ltr">{social.value}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <GlassCard className="p-8 flex flex-col gap-8 rounded-[2.5rem] border-primary/10">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">{t.contact.hours}</p>
                <p className="font-bold text-lg">{t.contact.hoursVal}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">{t.contact.location}</p>
                <p className="font-bold text-lg leading-tight text-foreground/90">{t.contact.locationVal}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Contact Form (7 columns) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 md:p-12 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-[3rem]">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-10">{t.contact.send_message}</h2>
            <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.contact.form.name}</Label>
                  <Input id="name" placeholder={t.contact.form.placeholders.name} className="h-16 rounded-2xl glass border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all text-base px-6 shadow-xl" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.contact.form.email}</Label>
                  <Input id="email" type="email" placeholder={t.contact.form.placeholders.email} className="h-16 rounded-2xl glass border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all text-base px-6 shadow-xl" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.contact.form.subject}</Label>
                <Input id="subject" placeholder={t.contact.form.placeholders.subject} className="h-16 rounded-2xl glass border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all text-base px-6 shadow-xl" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.contact.form.message}</Label>
                <Textarea id="message" placeholder={t.contact.form.placeholders.message} className="min-h-[180px] rounded-3xl glass border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all pt-6 px-6 text-base shadow-xl resize-none" />
              </div>
              <Button type="submit" size="lg" className="h-18 rounded-[2rem] bg-primary text-black font-black shadow-[0_15px_40px_rgba(255,140,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all gap-4 text-xl">
                <Send className={cn(locale === "ar" ? "rotate-180" : "", "h-6 w-6")} />
                {t.contact.form.send}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Map Section */}
      <section className="px-4">
        <div className="h-[500px] md:h-[600px] w-full rounded-[4rem] overflow-hidden glass-premium relative group shadow-2xl">
          <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-muted">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <MapPin className="h-12 w-12 text-primary glow-primary" />
              </div>
              <p className="font-black tracking-[0.5em] uppercase text-sm md:text-base">{t.contact.mapLoading}</p>
            </div>
          </div>
          {/* Decorative Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-6">
            <GlassCard className="p-6 text-center border-white/10 backdrop-blur-3xl shadow-2xl">
              <p className="text-sm text-muted font-bold uppercase tracking-widest mb-3">{t.contact.restaurant_location}</p>
              <p className="font-black text-lg mb-6">{t.contact.locationVal}</p>
              <Button className="w-full h-12 rounded-xl bg-primary text-black font-black shadow-lg">
                {t.contact.get_directions}
              </Button>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
