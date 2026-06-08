"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, LogOut, ShieldCheck, Bell, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { logAction } from "@/lib/admin/activity";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/products", icon: Package, label: "Menu Catalog" },
  { href: "/admin/orders", icon: ClipboardList, label: "Order Stream" },
  { href: "/admin/notifications", icon: Bell, label: "Alerts" },
  { href: "/admin/activity", icon: History, label: "Audit Trail" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? null);
    });

    // Initial count
    supabase.from("admin_notifications").select("id", { count: "exact" }).eq("is_read", false).then(({ count }) => {
        setUnreadCount(count || 0);
    });

    // Realtime listener for unread count
    const channel = supabase.channel("admin-nav-alerts").on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, () => {
        supabase.from("admin_notifications").select("id", { count: "exact" }).eq("is_read", false).then(({ count }) => {
            setUnreadCount(count || 0);
        });
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await logAction('login', 'auth', user.id, `Admin logged out: ${user.email}`);
    }
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-widest transition-all duration-300 relative",
                active
                  ? "bg-primary text-black shadow-[0_0_20px_rgba(255,140,0,0.3)] scale-105"
                  : "glass text-muted hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-black" : "text-primary")} />
              {label}
              {label === "Alerts" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4 bg-white/5 pl-6 pr-3 py-2 rounded-2xl border border-white/5">
        <div className="flex flex-col text-right hidden sm:block">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Signed in as</p>
          <p className="text-xs font-bold text-foreground">{email || "Loading..."}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <ShieldCheck className="h-6 w-6 text-primary glow-primary" />
        </div>
        <Button
          variant="glass"
          size="icon"
          className="h-10 w-10 rounded-xl hover:text-red-400"
          onClick={signOut}
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
