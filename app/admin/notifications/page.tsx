"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle2, ShoppingBag, Info, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { t } = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-live-v2")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_notifications"
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n));
          } else if (payload.eventType === "DELETE") {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const supabase = createClient();
    await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    const supabase = createClient();
    await supabase.from("admin_notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const icons: Record<string, any> = {
    new_order: ShoppingBag,
    system: Info
  };

  return (
    <div className="flex flex-col gap-10">
      <AdminNav />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">{t.admin.notification_center}</h1>
          <p className="text-muted font-medium mt-1">{t.admin.audit_desc}</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            onClick={markAllRead} 
            variant="glass" 
            size="sm" 
            className="h-12 rounded-xl font-bold px-6"
            disabled={!notifications.some(n => !n.is_read)}
          >
            {t.admin.mark_all_read}
          </Button>
          <Button onClick={load} variant="glass" size="icon" className="h-12 w-12 rounded-xl">
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
        </div>
      </header>

      {loading && notifications.length === 0 ? (
        <div className="py-20 text-center glass rounded-[3rem]">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted font-black uppercase tracking-widest text-[10px]">{t.admin.syncing}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center glass rounded-[3rem] border-dashed border-white/10">
           <Bell className="h-12 w-12 mx-auto text-muted mb-4 opacity-20" />
           <p className="text-muted font-bold">{t.admin.noOrders}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const Icon = icons[n.type] || Info;
            return (
              <GlassCard 
                key={n.id} 
                className={cn(
                  "p-6 flex items-center gap-6 border-white/5 transition-all duration-300",
                  !n.is_read ? "bg-primary/5 border-primary/20 shadow-[0_10px_30px_rgba(255,140,0,0.1)]" : "opacity-60"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                  !n.is_read ? "bg-primary/10 text-primary" : "bg-white/5 text-muted"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-white truncate">{n.title}</h3>
                    {!n.is_read && <Badge variant="default" className="bg-primary text-black h-4 px-1.5 text-[8px] font-black uppercase">NEW</Badge>}
                  </div>
                  <p className="text-xs text-muted font-medium line-clamp-1">{n.message}</p>
                  <p className="text-[9px] text-muted/40 font-bold uppercase tracking-widest mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  {n.link && (
                    <Button asChild size="icon" variant="glass" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                      <Link href={n.link}><ExternalLink className="h-4 w-4" /></Link>
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button size="icon" variant="glass" className="h-10 w-10 rounded-xl" onClick={() => markAsRead(n.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="glass" className="h-10 w-10 rounded-xl text-red-400 hover:bg-red-400/10" onClick={() => deleteNotification(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
