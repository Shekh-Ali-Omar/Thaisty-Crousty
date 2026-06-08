"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, Clock, CreditCard, ShoppingBag, Phone, Hash } from "lucide-react";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass/GlassCard";

interface Props {
  order: (Order & { order_items: OrderItem[] }) | null;
  onClose: () => void;
  onStatusUpdate: (id: string, status: OrderStatus) => Promise<void>;
}

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

export function OrderDetailsModal({ order, onClose, onStatusUpdate }: Props) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] glass-strong border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] scrollbar-thin"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 p-8 flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <Hash className="h-6 w-6 text-primary" /> {order.order_number}
              </h2>
              <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">
                Received {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <Button 
              variant="glass" 
              size="icon" 
              className="h-12 w-12 rounded-2xl hover:bg-white/10 transition-colors" 
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-8 flex flex-col gap-10">
            {/* Customer & Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-primary">
                  <User className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Customer Details</span>
                </div>
                <div>
                  <p className="font-black text-lg">{order.name}</p>
                  <p className="text-muted font-medium flex items-center gap-2 mt-1">
                    <Phone className="h-3 w-3" /> {order.phone}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Delivery Route</span>
                </div>
                <p className="font-bold text-sm leading-relaxed">{order.address}</p>
              </GlassCard>
            </div>

            {/* Status Management */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-primary">
                  <Clock className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Processing Pipeline</span>
                </div>
                <Badge variant={statusVariant[order.status] as any} className="px-4 py-1.5 rounded-xl uppercase text-[10px] font-black shadow-lg">
                  {order.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ORDER_STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={order.status === s ? "default" : "glass"}
                    size="sm"
                    className={cn(
                      "rounded-xl font-black uppercase text-[10px] h-12 transition-all",
                      order.status === s && "bg-primary text-black scale-[1.02] shadow-[0_0_20px_rgba(255,140,0,0.4)]"
                    )}
                    onClick={() => onStatusUpdate(order.id, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </section>

            {/* Order Items */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Order Items</span>
              </div>
              <div className="flex flex-col gap-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                    <div className="flex flex-col">
                      <p className="font-black text-white">{item.product_name || "Premium Item"}</p>
                      <p className="text-[10px] text-muted font-black uppercase mt-1">
                        {item.quantity} units × {formatPrice(Number(item.price))}
                      </p>
                      {item.note && (
                        <p className="text-xs text-primary font-medium mt-2 italic">“{item.note}”</p>
                      )}
                    </div>
                    <p className="font-black text-xl tracking-tighter">{formatPrice(Number(item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Summary Footer */}
            <div className="mt-4 pt-8 border-t border-white/5 flex flex-col gap-6">
               <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">Total Revenue</span>
                  </div>
                  <span className="text-4xl font-black text-primary glow-primary tracking-tighter">
                    {formatPrice(Number(order.total))}
                  </span>
               </div>
               
               {order.notes && (
                  <div className="bg-primary/5 border border-primary/20 rounded-[1.5rem] p-6">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Internal Kitchen Note</p>
                    <p className="text-sm font-medium leading-relaxed italic opacity-80">{order.notes}</p>
                  </div>
               )}
            </div>
          </div>

          <div className="p-8 pt-0">
             <Button 
                variant="glass" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                onClick={onClose}
             >
                Close View
             </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
