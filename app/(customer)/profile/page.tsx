"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Settings, 
  LogOut, 
  Shield, 
  ShoppingBag, 
  Clock,
  ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/locale-provider";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/hooks";

export default function ProfilePage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isHydrated = useHydrated();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    }
    getSession();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
            <User className="h-12 w-12 text-muted" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">Your Profile</h1>
          <p className="text-muted text-lg mb-10">Sign in to manage your orders and account settings.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-primary text-black font-black shadow-lg">
              <Link href="/admin/login">Admin Access</Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="h-14 px-10 rounded-2xl font-bold">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-10 px-4 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[3rem] border border-white/5">
        <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20">
          <User className="h-12 w-12 text-primary glow-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gradient mb-1">
            Hello, {user.email?.split('@')[0]}
          </h1>
          <p className="text-muted font-medium flex items-center justify-center md:justify-start gap-2">
            <Mail className="h-4 w-4" /> {user.email}
          </p>
        </div>
        <Button onClick={handleSignOut} variant="glass" className="h-12 rounded-xl text-red-400 border-red-400/10 hover:bg-red-400/5">
          <LogOut className="h-4 w-4 mr-2" />
          {t.admin.signOut}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-muted ms-2">Your Activity</h2>
          
          <Link href="/track-order">
            <GlassCard className="p-8 flex items-center gap-6 group hover:border-primary/20 transition-all border-white/5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-primary glow-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-black">{t.nav.track}</p>
                <p className="text-sm text-muted">View status of your current orders.</p>
              </div>
              <ChevronRight className="h-6 w-6 text-muted group-hover:text-primary transition-colors" />
            </GlassCard>
          </Link>

          <GlassCard className="p-8 flex items-center gap-6 border-white/5 opacity-50 cursor-not-allowed">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-black">Order History</p>
              <p className="text-sm text-muted">Coming soon in the next update.</p>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-muted ms-2">Account</h2>
          <GlassCard className="p-6 flex flex-col gap-4 border-white/5">
            <Button asChild variant="ghost" className="justify-start h-12 rounded-xl hover:bg-white/5">
              <Link href="/admin" className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold">{t.profile.admin}</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start h-12 rounded-xl hover:bg-white/5 opacity-50 cursor-not-allowed">
              <Settings className="h-5 w-5" />
              <span className="font-bold">Settings</span>
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Minimal missing Link import fix
import Link from "next/link";
