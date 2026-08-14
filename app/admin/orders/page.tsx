"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES, RESTAURANT_ID } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { RefreshCw, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { logAction } from "@/lib/admin/activity";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { GlassCard } from "@/components/glass/GlassCard";
import { useLocale } from "@/components/locale-provider";

type OrderRow = Order & { order_items: OrderItem[] };

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  pending: "warning",
  confirmed: "default",
  preparing: "secondary",
  ready: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

export default function AdminOrdersPage() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
          setOrders((data as OrderRow[]) ?? []);
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    const supabase = createClient();
    const channel = supabase
      .channel("orders-realtime-v2")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data } = await supabase
              .from("orders")
              .select("*, order_items(*)")
              .eq("id", payload.new.id)
              .single();
            
            if (data) {
              setOrders(prev => [data as OrderRow, ...prev]);
            }
          } 
          
          if (payload.eventType === "UPDATE") {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } as OrderRow : o));
            setSelected(s => s?.id === payload.new.id ? { ...s, ...payload.new } as OrderRow : s);
          }

          if (payload.eventType === "DELETE") {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            if (selected?.id === payload.old.id) setSelected(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, selected?.id]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (!error) {
      await logAction('status_change', 'order', orderId, `Changed order status to ${status}`);
    }
  };

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: "order_number",
      header: t.order.number,
      cell: ({ row }) => <span className="font-black text-primary tracking-tighter">{row.getValue("order_number")}</span>
    },
    {
      accessorKey: "name",
      header: t.checkout.customer,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-white/90">{row.getValue("name")}</span>
          <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{row.original.phone}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: t.order.status,
      cell: ({ row }) => {
        const s = row.getValue("status") as OrderStatus;
        return (
          <Badge variant={statusVariant[s] as "default" | "secondary" | "destructive" | "outline"} className="uppercase text-[8px] font-black rounded-lg px-2 py-0.5">
            {t.order.statuses[s] || s}
          </Badge>
        );
      }
    },
    {
      accessorKey: "total",
      header: t.cart.total,
      cell: ({ row }) => <span className="font-black text-white">{formatPrice(Number(row.getValue("total")))}</span>
    },
    {
      accessorKey: "created_at",
      header: t.order.date,
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button size="sm" variant="glass" className="h-8 rounded-lg p-0 px-2 text-[10px] font-black uppercase" onClick={() => setSelected(row.original)}>
          {t.admin.orderDetails}
        </Button>
      )
    }
  ];

  const filteredData = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="flex flex-col gap-10 pt-20 pb-20">
      <AdminNav />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <Hash className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">{t.profile.logistics}</span>
            </div>
            <h1 className="text-display text-gradient-white leading-none">{t.admin.order_stream}</h1>
            <p className="text-white/40 font-medium text-lg mt-4 max-w-md">
                {t.admin.order_desc}
            </p>
        </div>

        <div className="flex items-center gap-4">
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-14 w-56 rounded-2xl material-thin border-white/5 font-black uppercase text-[10px] tracking-widest text-white/60"
          >
            <option value="all">{t.admin.all_statuses}</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{(t.order.statuses as Record<string, string>)[s]?.toUpperCase() || s.toUpperCase()}</option>
            ))}
          </Select>
          <Button onClick={load} variant="glass" size="icon" className="h-14 w-14 rounded-2xl shadow-xl">
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
        </div>
      </header>

      <section className="px-4">
          <GlassCard className="p-8 rounded-[3rem] shadow-2xl border-white/5">
            {loading && orders.length === 0 ? (
               <div className="py-24 text-center">
                  <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-6" />
                  <p className="text-white/20 font-black uppercase tracking-widest text-xs">{t.admin.syncing}</p>
                </div>
            ) : (
              <DataTable columns={columns} data={filteredData} searchKey="order_number" placeholder={t.admin.identify} />
            )}
          </GlassCard>
      </section>

      <OrderDetailsModal 
        order={selected} 
        onClose={() => setSelected(null)} 
        onStatusUpdate={updateStatus} 
      />
    </div>
  );
}
