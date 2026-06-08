"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass/GlassCard";

export default function TrackOrderPage() {
  const { t } = useLocale();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    const supabase = createClient();
    
    try {
      // Find order by order_number AND phone for security
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .ilike("order_number", orderNumber.trim())
        .eq("phone", phone.trim())
        .single();

      if (fetchError || !data) {
        setError(t.order.notFound);
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: "pending", icon: Clock },
    { key: "confirmed", icon: CheckCircle2 },
    { key: "preparing", icon: Package },
    { key: "ready", icon: AlertCircle },
    { key: "delivered", icon: Truck },
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order?.status);

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-10 py-10 px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gradient mb-4">
          {t.order.track}
        </h1>
        <p className="text-muted font-medium">{t.order.trackDesc}</p>
      </div>

      <GlassCard className="p-8 border-white/10 shadow-2xl">
        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">
              {t.order.number}
            </Label>
            <Input 
              placeholder="TC-1001" 
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="h-12 rounded-xl glass border-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">
              {t.checkout.phone}
            </Label>
            <Input 
              type="tel"
              placeholder="0555..." 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-xl glass border-white/5"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-12 rounded-xl bg-primary text-black font-bold shadow-lg"
          >
            {loading ? t.common.loading : t.order.track}
          </Button>
        </form>
        {error && (
          <p className="mt-4 text-center text-sm text-red-400 font-bold">{error}</p>
        )}
      </GlassCard>

      <AnimatePresence mode="wait">
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8"
          >
            {/* Status Steps */}
            <GlassCard className="p-8 border-primary/10 overflow-x-auto">
              <div className="flex justify-between min-w-[500px] relative">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/5 z-0" />
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-1000 z-0" 
                  style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                />

                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = i <= currentStatusIndex;
                  const isCurrent = i === currentStatusIndex;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-3 w-20">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500",
                        isDone ? "bg-primary text-black shadow-[0_0_15px_rgba(255,140,0,0.5)]" : "bg-zinc-900 text-muted border border-white/5"
                      )}>
                        <Icon className={cn("h-5 w-5", isCurrent && "animate-pulse")} />
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-tighter text-center",
                        isDone ? "text-primary" : "text-muted"
                      )}>
                        {(t.order.statuses as any)[step.key]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6">Order Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Date</span>
                    <span className="font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">{t.order.payment}</span>
                    <span className={cn("font-bold", order.payment_status === 'paid' ? 'text-green-400' : 'text-primary')}>
                      {(t.order as any)[order.payment_status]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">{t.checkout.address}</span>
                    <span className="font-bold text-end max-w-[150px]">{order.address}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6">Items</h3>
                <ul className="space-y-3 mb-6">
                  {order.order_items.map((i: any) => (
                    <li key={i.id} className="flex justify-between text-xs">
                      <span>{i.product_name} × {i.quantity}</span>
                      <span className="font-bold">{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="h-px bg-white/5 my-3" />
                <div className="flex justify-between items-center font-black">
                  <span>Total</span>
                  <span className="text-xl text-primary">{formatPrice(order.total)}</span>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
