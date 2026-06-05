"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES, RESTAURANT_ID } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

type OrderRow = Order & { order_items: OrderItem[] };

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning"
> = {
  pending: "warning",
  confirmed: "default",
  preparing: "secondary",
  delivered: "success",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("restaurant_id", RESTAURANT_ID)
      .order("created_at", { ascending: false });
    setOrders((data as OrderRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
    load();
    if (selected?.id === orderId) {
      setSelected((s) => (s ? { ...s, status } : null));
    }
  };

  return (
    <>
      <AdminNav />
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">No orders yet</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="flex flex-col gap-2">
            {orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => setSelected(order)}
                  className={`w-full rounded-lg border p-4 text-start transition-colors duration-150 ${
                    selected?.id === order.id
                      ? "border-primary bg-primary/5"
                      : "border-white/10 bg-surface hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{order.name}</span>
                    <Badge variant={statusVariant[order.status]}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">{order.phone}</p>
                  <p className="text-sm text-primary">
                    {formatPrice(Number(order.total))}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <Card>
              <CardHeader>
                <CardTitle>Order details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p>{selected.phone}</p>
                  <p>{selected.address}</p>
                  {selected.notes && (
                    <p className="text-sm text-muted mt-1">{selected.notes}</p>
                  )}
                </div>
                <ul className="space-y-1 text-sm border-t border-white/10 pt-3">
                  {selected.order_items?.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>× {item.quantity}</span>
                      <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-bold">
                  Total: {formatPrice(Number(selected.total))}
                </p>
                <div>
                  <label className="text-sm text-muted">Status</label>
                  <Select
                    value={selected.status}
                    className="mt-1"
                    onChange={(e) =>
                      updateStatus(
                        selected.id,
                        e.target.value as OrderStatus
                      )
                    }
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
