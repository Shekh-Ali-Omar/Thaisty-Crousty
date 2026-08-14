"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { RESTAURANT_ID } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import { Printer, Clock, CheckCircle2, XCircle, RefreshCw, Hash, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassCard";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { logAction } from "@/lib/admin/activity";
import { toast } from "sonner";
import useSound from "use-sound";

type OrderWithItems = Order & { order_items: OrderItem[] };

/**
 * THAISTY PRINTING HUB
 * Specialized interface for monitoring thermal receipt production queue.
 * Features ultra-responsive realtime updates with sound and visual alerts.
 */
export default function PrintingStatusPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrderWithItems | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [playAlert] = useSound("/sounds/order-ping.mp3", { volume: 0.7 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", RESTAURANT_ID)
        .order("created_at", { ascending: false });
      
      if (!error) {
        setOrders((data as OrderWithItems[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    
    const supabase = createClient();
    
    // REALTIME INFRASTRUCTURE
    const channel = supabase
      .channel("printing-status-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          // 1. Fetch full order enriched with items
          const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            const newOrder = data as OrderWithItems;
            
            // 2. Interactive Alert
            try {
                playAlert();
            } catch (err) {
                console.warn("Sound playback blocked", err);
            }

            // 3. Immersive Notification
            toast.custom(() => (
              <div className="bg-[#0F0F0F] border border-primary/30 p-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-start gap-4 min-w-[320px] animate-in slide-in-from-right duration-500">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Printer className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white uppercase tracking-widest mb-1">Incoming Print Job</p>
                  <p className="text-xs text-muted font-medium">Order {newOrder.order_number} just arrived.</p>
                </div>
              </div>
            ));

            // 4. Update Pipeline
            setOrders(prev => [newOrder, ...prev]);
            setNewOrderIds(prev => new Set(prev).add(newOrder.id));

            // Auto-clear visual highlight
            setTimeout(() => {
              setNewOrderIds(prev => {
                const next = new Set(prev);
                next.delete(newOrder.id);
                return next;
              });
            }, 10000);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } as OrderWithItems : o));
          setSelected(prev => prev?.id === payload.new.id ? { ...prev, ...payload.new } as OrderWithItems : prev);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, playAlert]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (!error) {
      await logAction('status_change', 'order', orderId, `Changed order status to ${status}`);
    }
  };

  const pending = orders.filter(o => o.print_status === 'pending');
  const printed = orders.filter(o => o.print_status === 'printed').slice(0, 10);
  const failed = orders.filter(o => o.print_status === 'failed');

  const OrderCard = ({ order }: { order: OrderWithItems }) => {
    const isNew = newOrderIds.has(order.id);
    
    return (
      <GlassCard 
        onClick={() => setSelected(order)}
        className={cn(
          "p-5 border-white/5 hover:border-primary/30 transition-all cursor-pointer group bg-white/[0.02]",
          isNew && "border-primary/50 shadow-[0_0_30px_rgba(255,140,0,0.3)] animate-pulse-glow"
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-primary" />
              <span className="text-lg font-black text-white tracking-tighter">{order.order_number}</span>
              {isNew && <span className="h-2 w-2 rounded-full bg-primary animate-ping" />}
          </div>
          <span className="text-[9px] font-black uppercase text-white/20">
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-white/40" />
              <span className="text-xs font-bold text-white/70 line-clamp-1">{order.name}</span>
          </div>
          <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-white/40" />
              <span className="text-[10px] text-white/40 font-medium line-clamp-1">{order.address}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <span className="text-sm font-black text-primary">{formatPrice(Number(order.total))}</span>
          <Button size="sm" variant="glass" className="h-8 rounded-lg text-[8px] font-black uppercase tracking-widest px-3">
              Details
          </Button>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="flex flex-col gap-10 pt-20 pb-20 px-4">
      <AdminNav />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <Printer className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Management Systems</span>
            </div>
            <h1 className="text-display text-gradient-white leading-none">Printing Status</h1>
            <p className="text-white/40 font-medium text-lg mt-4 max-w-md">
                Monitor and manage thermal receipt production queue.
            </p>
        </div>

        <Button onClick={load} variant="glass" size="icon" className="h-14 w-14 rounded-2xl shadow-xl">
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column: Pending */}
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-warning" />
                    <h2 className="text-xl font-black uppercase tracking-widest">Pending</h2>
                </div>
                <span className="h-6 min-w-[24px] rounded-full bg-warning/20 text-warning text-[10px] font-black flex items-center justify-center px-2">
                    {pending.length}
                </span>
            </div>
            <div className="flex flex-col gap-4">
                {pending.length === 0 ? (
                    <div className="p-12 text-center glass rounded-[2rem] border-white/5 opacity-20">
                        <Printer className="h-10 w-10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Queue Empty</p>
                    </div>
                ) : pending.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
        </div>

        {/* Column: Printed */}
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <h2 className="text-xl font-black uppercase tracking-widest">Printed</h2>
                </div>
                <span className="h-6 min-w-[24px] rounded-full bg-success/20 text-success text-[10px] font-black flex items-center justify-center px-2">
                    {printed.length}
                </span>
            </div>
            <div className="flex flex-col gap-4">
                {printed.length === 0 ? (
                    <div className="p-12 text-center glass rounded-[2rem] border-white/5 opacity-20">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No History</p>
                    </div>
                ) : printed.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
        </div>

        {/* Column: Failed */}
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <h2 className="text-xl font-black uppercase tracking-widest">Failed</h2>
                </div>
                <span className="h-6 min-w-[24px] rounded-full bg-destructive/20 text-destructive text-[10px] font-black flex items-center justify-center px-2">
                    {failed.length}
                </span>
            </div>
            <div className="flex flex-col gap-4">
                {failed.length === 0 ? (
                    <div className="p-12 text-center glass rounded-[2rem] border-white/5 opacity-20">
                        <XCircle className="h-10 w-10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Clean Status</p>
                    </div>
                ) : failed.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
        </div>
      </div>

      <OrderDetailsModal 
        order={selected} 
        onClose={() => setSelected(null)} 
        onStatusUpdate={updateStatus} 
      />
    </div>
  );
}
