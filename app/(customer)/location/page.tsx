"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Car, 
  Navigation, 
  Bike, 
  Clock,
  Camera,
  Phone
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";

export default function LocationPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-16 pb-20">
      <section className="text-center max-w-3xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-primary mb-6"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">{t.nav.location}</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-gradient mb-8"
        >
          {t.location.title}
        </motion.h1>
      </section>

      {/* Hero Map Section */}
      <section className="h-[500px] w-full rounded-[3rem] overflow-hidden glass-premium relative">
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted">
            <Navigation className="h-16 w-16 animate-pulse" />
            <p className="font-bold tracking-[0.3em] uppercase text-xs">{t.contact.mapLoading}</p>
          </div>
        </div>
        <div className="absolute top-8 left-8 z-10">
          <GlassCard className="p-6 backdrop-blur-3xl border-white/10 shadow-2xl max-w-xs">
            <p className="text-lg font-black tracking-tight mb-2">Thaisty Crousty</p>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {t.contact.locationVal}
            </p>
            <Button className="w-full h-12 rounded-xl bg-primary text-black font-black">
              {t.location.directions}
            </Button>
          </GlassCard>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      </section>

      {/* Details Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GlassCard className="p-8 flex flex-col gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Car className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight mb-2">{t.location.parking.title}</h3>
            <p className="text-muted leading-relaxed">
              {t.location.parking.desc}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bike className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight mb-2">{t.location.delivery.title}</h3>
            <p className="text-muted leading-relaxed">
              {t.location.delivery.desc}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight mb-2">{t.location.hours.title}</h3>
            <p className="text-muted leading-relaxed">
              {t.location.hours.desc}
            </p>
          </div>
        </GlassCard>
      </section>

      {/* Social CTA */}
      <section className="text-center py-12">
        <p className="text-muted font-bold tracking-widest uppercase text-xs mb-8">{t.location.follow}</p>
        <div className="flex flex-wrap justify-center gap-6">
          <Button variant="glass" className="h-16 px-10 rounded-2xl gap-3 text-lg font-bold">
            <Camera className="h-6 w-6" />
            @thaistycrousty
          </Button>
          <Button variant="glass" className="h-16 px-10 rounded-2xl gap-3 text-lg font-bold">
            <Phone className="h-6 w-6" />
            +213 555 123 456
          </Button>
        </div>
      </section>
    </div>
  );
}
