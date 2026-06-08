"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES, RESTAURANT_ID } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ShoppingBag, User, MapPin, Clock, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { logAction } from "@/lib/admin/activity";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";

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
    load();

    // REALTIME SUBSCRIPTION
    const supabase = createClient();
    const channel = supabase
      .channel("orders-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          console.log("[REALTIME_DASHBOARD_EVENT]:", payload);
          
          if (payload.eventType === "INSERT") {
            // Fetch the new order with items
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
            // Update details pane if open
            setSelected(s => s?.id === payload.new.id ? { ...s, ...payload.new } as OrderRow : s);
          }

          if (payload.eventType === "DELETE") {
            setOrders(prev => prev.filter(o => o.id === payload.old.id));
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
      header: "Order #",
      cell: ({ row }) => <span className="font-black">{row.getValue("order_number")}</span>
    },
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.getValue("name")}</span>
          <span className="text-[10px] text-muted font-bold">{row.original.phone}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status") as OrderStatus;
        return (
          <Badge variant={statusVariant[s] as any} className="uppercase text-[9px] font-black rounded-lg">
            {s}
          </Badge>
        );
      }
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-black text-primary">{formatPrice(Number(row.getValue("total")))}</span>
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <div className="flex flex-col text-[10px] font-medium text-muted">
            <span>{date.toLocaleDateString()}</span>
            <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button size="sm" variant="glass" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-tighter" onClick={() => setSelected(row.original)}>
          Details
        </Button>
      )
    }
  ];

  const filteredData = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="flex flex-col gap-10">
      <AdminNav />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Order Stream</h1>
          <p className="text-muted font-medium">Real-time order processing and fulfillment.</p>
        </div>
        <div className="flex gap-2">
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 w-48 rounded-2xl glass border-white/10"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>
          <Button onClick={load} variant="glass" size="icon" className="h-12 w-12 rounded-2xl">
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="w-full">
        {loading && orders.length === 0 ? (
           <div className="py-20 text-center glass rounded-[3rem]">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted font-black uppercase tracking-widest text-xs">Syncing Live Stream...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} searchKey="order_number" placeholder="Search by Order #, Name or Phone..." />
        )}
      </div>

      <OrderDetailsModal 
        order={selected} 
        onClose={() => setSelected(null)} 
        onStatusUpdate={updateStatus} 
      />
    </div>
  );
}
