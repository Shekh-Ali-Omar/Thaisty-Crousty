"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, Clock, ShoppingBag, Phone, Hash, Calendar, Tag, Printer } from "lucide-react";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass/GlassCard";
import { useLocale } from "@/components/locale-provider";
import { ReceiptTemplate } from "./ReceiptTemplate";
import { createClient } from "@/lib/supabase/client";
import { logAction } from "@/lib/admin/activity";
import { useRef } from "react";

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

/**
 * THAISTY COMMAND MODAL - ORDER LOGISTICS
 * Implements ultra-material glass with multi-layer depth for heavy information.
 */
export function OrderDetailsModal({ order, onClose, onStatusUpdate }: Props) {
  const { t } = useLocale();
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!order || !receiptRef.current) return;
    
    // Get clean HTML from the template
    const receiptHTML = receiptRef.current.innerHTML;
    
    // Create isolated print window
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${order.order_number}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                width: 80mm;
                background: #ffffff;
                color: #000000;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${receiptHTML}
            <script>
              window.addEventListener('load', () => {
                window.print();
                setTimeout(() => window.close(), 500);
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    
    // Update print status in background
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ 
        print_status: "printed",
        printed_at: new Date().toISOString()
      })
      .eq("id", order.id);
      
    if (!error) {
      await logAction('print', 'order', order.id, `Printed receipt for order ${order.order_number}`);
    }
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 overflow-hidden">
        {/* Apple Pro Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        />

        {/* Hidden template for grabbing HTML */}
        <div ref={receiptRef} className="hidden" aria-hidden="true">
           <ReceiptTemplate order={order} />
        </div>

        {/* Liquid Glass Command Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl h-full max-h-[850px] overflow-hidden rounded-[4rem] glass-premium border border-white/10 shadow-[0_100px_150px_rgba(0,0,0,1)] flex flex-col"
        >
          {/* Top Control Bar */}
          <div className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <Hash className="h-8 w-8 text-primary glow-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-4xl font-black tracking-tighter text-white uppercase">{order.order_number}</h2>
                <div className="flex items-center gap-3 text-white/30 font-bold uppercase text-[10px] tracking-widest">
                    <Calendar className="h-3 w-3" />
                    <span>{t.checkout.finalConfirm} {new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <Button 
                  onClick={handlePrint}
                  className="h-12 px-6 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:scale-105 transition-all"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
                <Badge variant={statusVariant[order.status] as "default" | "secondary" | "success" | "warning" | "destructive"} className="h-12 px-6 rounded-full uppercase text-[10px] font-black shadow-2xl border-white/10">
                  {t.order.statuses[order.status] || order.status}
                </Badge>
                <Button 
                  variant="glass" 
                  size="icon" 
                  className="h-14 w-14 rounded-[1.5rem] hover:bg-white/10 transition-all border-white/5" 
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </Button>
            </div>
          </div>

          {/* Logistics Stream */}
          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Data & Status */}
              <div className="lg:col-span-7 flex flex-col gap-10">
                
                {/* Logistics Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-8 border-white/5 flex flex-col gap-5">
                        <div className="flex items-center gap-3 text-primary">
                          <User className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.profile.identity_required}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="font-black text-2xl text-white tracking-tight">{order.name}</p>
                            <p className="text-white/40 font-medium flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" /> {order.phone}
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 border-white/5 flex flex-col gap-5">
                        <div className="flex items-center gap-3 text-primary">
                          <MapPin className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.checkout.deliveryInfo}</span>
                        </div>
                        <p className="font-bold text-sm text-white/70 leading-relaxed line-clamp-3">{order.address}</p>
                    </GlassCard>
                </div>

                {/* Operations Pipeline */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-black tracking-tight text-white uppercase italic">{t.profile.logistics}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ORDER_STATUSES.map((s) => (
                      <Button
                        key={s}
                        variant={order.status === s ? "default" : "glass"}
                        className={cn(
                          "h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-500",
                          order.status === s ? "bg-primary text-black scale-[1.05] shadow-[0_0_30px_rgba(255,140,0,0.4)]" : "opacity-40 hover:opacity-100"
                        )}
                        onClick={() => onStatusUpdate(order.id, s)}
                      >
                        {(t.order.statuses as Record<string, string>)[s] || s}
                      </Button>
                    ))}
                  </div>
                </section>

                {/* Internal Notes */}
                {order.notes && (
                  <GlassCard className="p-10 border-primary/20 bg-primary/5 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 text-primary mb-4">
                        <Tag className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Internal Logistics Memo</span>
                    </div>
                    <p className="text-lg font-medium text-white/80 leading-relaxed italic">“{order.notes}”</p>
                  </GlassCard>
                )}
              </div>

              {/* Right Column: Order Manifest */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                 <div className="flex items-center gap-4 px-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-black tracking-tight text-white uppercase italic">{t.cart.summary}</h3>
                  </div>
                  
                  <GlassCard className="flex-1 p-8 rounded-[3rem] border-white/5 flex flex-col gap-6 shadow-inner">
                    <div className="flex-1 flex flex-col gap-4">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 group hover:bg-white/[0.05] transition-all">
                            <div className="flex flex-col gap-1">
                              <p className="font-black text-white text-lg tracking-tighter">{item.product_name || "Premium Asset"}</p>
                              <p className="text-[10px] text-white/20 font-black uppercase">
                                {item.quantity} units × {formatPrice(Number(item.price))}
                              </p>
                              {item.note && (
                                <p className="text-[10px] text-primary font-bold mt-2 opacity-60 italic">Note: {item.note}</p>
                              )}
                            </div>
                            <p className="font-black text-white text-xl tracking-tighter">{formatPrice(Number(item.price) * item.quantity)}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div className="pt-8 border-t border-white/10 flex flex-col gap-6">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t.profile.management} {t.admin.revenue}</span>
                            <span className="text-5xl font-black text-primary glow-primary tracking-[ -0.1em]">
                                {formatPrice(Number(order.total))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t.order.payment}</span>
                            <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'} className="h-8 px-5 rounded-full uppercase text-[10px] font-black">
                                {(t.order as unknown as Record<string, string>)[order.payment_status] || order.payment_status}
                            </Badge>
                        </div>
                    </div>
                  </GlassCard>
              </div>

            </div>
          </div>

          {/* Action Footer */}
          <div className="p-10 bg-white/[0.01] border-t border-white/5">
             <Button 
                variant="glass" 
                className="w-full h-18 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs transition-all hover:bg-white/5 active:scale-95"
                onClick={onClose}
             >
                {t.admin.cancel}
             </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
