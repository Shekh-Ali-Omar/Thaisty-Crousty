"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  RefreshCw,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_ID } from "@/lib/constants";
import { formatPrice, cn } from "@/lib/utils";
import { GlassCard } from "@/components/glass/GlassCard";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

type AnalyticsData = {
  revenue: {
    today: number;
    week: number;
    month: number;
    lifetime: number;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
  aov: number;
  popularProducts: { name: string; count: number }[];
  trends: { date: string; revenue: number; orders: number }[];
};

export default function AdminPage() {
  const { t } = useLocale();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", RESTAURANT_ID)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!orders) return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let revToday = 0, revWeek = 0, revMonth = 0, revTotal = 0;
      let ordPending = 0, ordConfirmed = 0, ordDelivered = 0, ordCancelled = 0;
      
      const productCounts: Record<string, number> = {};
      const trendMap: Record<string, { revenue: number; orders: number }> = {};

      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const s = d.toISOString().split('T')[0];
        trendMap[s] = { revenue: 0, orders: 0 };
      }

      orders.forEach(o => {
        const orderDate = new Date(o.created_at);
        const orderDateStr = o.created_at.split('T')[0];
        const val = Number(o.total);

        if (o.status === 'pending') ordPending++;
        if (o.status === 'confirmed') ordConfirmed++;
        if (o.status === 'delivered') ordDelivered++;
        if (o.status === 'cancelled') ordCancelled++;

        if (o.status !== 'cancelled') {
          revTotal += val;
          if (orderDateStr === todayStr) revToday += val;
          if (orderDate >= weekAgo) revWeek += val;
          if (orderDate >= monthAgo) revMonth += val;
          
          if (trendMap[orderDateStr]) {
            trendMap[orderDateStr].revenue += val;
            trendMap[orderDateStr].orders += 1;
          }

          o.order_items.forEach((oi: any) => {
            productCounts[oi.product_name] = (productCounts[oi.product_name] || 0) + oi.quantity;
          });
        }
      });

      const popular = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const trends = Object.entries(trendMap).map(([date, vals]) => ({
        date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        ...vals
      }));

      setData({
        revenue: { today: revToday, week: revWeek, month: revMonth, lifetime: revTotal },
        orders: { 
          total: orders.length, 
          pending: ordPending, 
          confirmed: ordConfirmed,
          delivered: ordDelivered,
          cancelled: ordCancelled 
        },
        aov: orders.length > 0 ? revTotal / orders.filter(o => o.status !== 'cancelled').length : 0,
        popularProducts: popular,
        trends
      });
    } catch (err) {
      console.error("[ANALYTICS_ERROR]:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const metrics = [
    { label: t.admin.revenue, value: formatPrice(data?.revenue.today ?? 0), icon: DollarSign, color: "text-green-400" },
    { label: t.admin.active_pipeline, value: (data?.orders.pending ?? 0) + (data?.orders.confirmed ?? 0), icon: Clock, color: "text-orange-400" },
    { label: t.admin.fulfillment, value: data?.orders.delivered ?? 0, icon: CheckCircle2, color: "text-blue-400" },
    { label: t.admin.avg_ticket, value: formatPrice(data?.aov ?? 0), icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <AdminNav />
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-gradient">{t.admin.live_analytics}</h1>
          <p className="text-muted font-medium mt-2">{t.admin.performance_desc}</p>
        </div>
        <Button onClick={loadAnalytics} variant="glass" className="h-14 px-8 rounded-2xl gap-3 font-black transition-all hover:scale-105 active:scale-95">
          <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          {t.admin.sync_intelligence}
        </Button>
      </header>

      {/* Primary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <GlassCard key={i} className="p-8 border-white/5 flex flex-col gap-4 group hover:border-primary/20 transition-all">
            <div className={cn("h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner", m.color)}>
              <m.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">{m.label}</p>
              <p className="text-4xl font-black tracking-tighter">{m.value}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Charts Engine */}
      {data && <AnalyticsCharts data={data.trends} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Performance Stats */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <h2 className="text-2xl font-black tracking-tight px-2 flex items-center gap-3">
            <Star className="h-6 w-6 text-primary" /> {t.admin.best_sellers}
          </h2>
          <GlassCard className="p-8 border-white/5 flex flex-col gap-6 h-full rounded-[3rem] glass-strong">
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            ) : data?.popularProducts.length === 0 ? (
              <p className="text-muted text-center py-10 italic">Awaiting first transactions...</p>
            ) : (
              <div className="flex flex-col gap-4">
                {data?.popularProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-colors">
                    <div>
                      <p className="font-bold text-sm text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest">{p.count} units moved</p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 group-hover:scale-110 transition-transform">
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-auto text-[9px] text-muted text-center font-black uppercase tracking-[0.3em] opacity-30">Audited Sales Data</p>
          </GlassCard>
        </section>

        {/* Status Hub */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-2xl font-black tracking-tight px-2 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-primary" /> {t.admin.system_status}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-8 flex flex-col gap-6 border-white/5">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black tracking-tighter">{data?.orders.delivered ?? 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">{t.admin.delivered}</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: `${(data?.orders.delivered || 0) / (data?.orders.total || 1) * 100}%` }} />
              </div>
            </GlassCard>

            <GlassCard className="p-8 flex flex-col gap-6 border-white/5">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black tracking-tighter">{data?.orders.cancelled ?? 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">{t.admin.cancelled}</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-400" style={{ width: `${(data?.orders.cancelled || 0) / (data?.orders.total || 1) * 100}%` }} />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
             <GlassCard className="p-10 border-white/5 flex flex-col gap-4 bg-primary/5 hover:border-primary/20 transition-all group">
                <h3 className="text-xl font-black">{t.admin.sync_intelligence}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-black tracking-tighter">{data?.revenue.week ? formatPrice(data.revenue.week) : '0 DA'}</p>
                    <p className="text-[9px] font-black uppercase text-muted">Last 7 Days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tighter">{data?.revenue.month ? formatPrice(data.revenue.month) : '0 DA'}</p>
                    <p className="text-[9px] font-black uppercase text-muted">Last 30 Days</p>
                  </div>
                </div>
             </GlassCard>
             <GlassCard className="p-10 border-white/5 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-5xl font-black tracking-tighter text-gradient">{data?.orders.total ?? 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">{t.admin.lifetime_volume}</p>
             </GlassCard>
          </div>
        </section>
      </div>
    </div>
  );
}

import { Loader2 } from "lucide-react";
