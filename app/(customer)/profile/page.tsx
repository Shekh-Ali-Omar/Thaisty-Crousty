"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  Palette,
  Globe,
  Check,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/glass/GlassCard";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";

export default function ProfilePage() {
  const isHydrated = useHydrated();
  const { t, locale, setLocale } = useLocale();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(!!profile?.is_admin);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-10 px-4 flex flex-col gap-10">
      {/* Simple Header */}
      <div className="flex flex-col items-center text-center gap-6">
        <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20">
          <User className="h-12 w-12 text-primary glow-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient-white uppercase">
            {t.profile.title}
          </h1>
          <p className="text-muted font-medium mt-2">{t.profile.interface_desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Language Switcher */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white/40">{t.profile.language}</h2>
          </div>
          
          <GlassCard className="p-8 border-white/5 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "en", label: "English" },
                { id: "fr", label: "Français" },
                { id: "ar", label: "العربية" }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLocale(lang.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-6 rounded-2xl transition-all border",
                    locale === lang.id 
                      ? "bg-primary text-black border-primary shadow-lg scale-105" 
                      : "glass border-white/5 text-muted hover:text-white"
                  )}
                >
                  <span className="font-black uppercase text-[10px] tracking-widest">{lang.label}</span>
                  {locale === lang.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Navigation Utilities */}
        <section className="space-y-6">
           <Link href="/menu">
                <GlassCard className="p-8 flex items-center justify-between group hover:border-primary/30 transition-all border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-primary glow-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{t.menu.viewAll}</p>
                            <p className="text-sm text-muted">{t.profile.continue_shopping}</p>
                        </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </GlassCard>
            </Link>
        </section>

        {/* Conditional Admin Hub */}
        {isAdmin && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white/40">{t.profile.management}</h2>
            </div>
            
            <Link href="/admin">
                <GlassCard className="p-8 flex items-center justify-between group hover:border-primary/30 transition-all border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-primary glow-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{t.profile.admin}</p>
                            <p className="text-sm text-muted">{t.profile.dashboard_desc}</p>
                        </div>
                    </div>
                    <Badge className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-3">{t.profile.authorized}</Badge>
                </GlassCard>
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
