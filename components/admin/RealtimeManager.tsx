"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import useSound from "use-sound";
import { createClient } from "@/lib/supabase/client";
import { Bell, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * REALTIME MANAGER
 * Global admin component that listens for new orders and system events.
 */
export function RealtimeManager() {
  const [playPing] = useSound("/sounds/order-ping.mp3", { volume: 0.5 });
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAdmin) return;

    const supabase = createClient();
    
    // 1. Subscribe to new orders
    const orderChannel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          console.log("[REALTIME_MANAGER_EVENT]: New Order Payload", payload);
          const newOrder = payload.new;
          
          // Play notification sound
          try {
            playPing();
          } catch (e) {
            console.warn("Sound playback blocked by browser policy");
          }

          // Show professional toast
          toast.custom((t) => (
            <div className="bg-[#0F0F0F] border border-primary/30 p-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-start gap-4 min-w-[350px]">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6 text-primary animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white uppercase tracking-widest mb-1">New Order Received</p>
                <p className="text-xs text-muted font-medium mb-3">Order {newOrder.order_number} just arrived from {newOrder.name}.</p>
                <Link 
                  href="/admin/orders" 
                  onClick={() => toast.dismiss(t)}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:underline"
                >
                  Process Order <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ), { duration: 10000 });

          // 2. Persist notification to DB
          await supabase.from("admin_notifications").insert({
            type: "new_order",
            title: `New Order: ${newOrder.order_number}`,
            message: `A new order of ${newOrder.total} DA from ${newOrder.name} is waiting for processing.`,
            link: "/admin/orders"
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[REALTIME]: Admin Order Stream active.");
        }
      });

    return () => {
      supabase.removeChannel(orderChannel);
    };
  }, [isAdmin, playPing]);

  if (!isAdmin) return null;

  return <Toaster position="top-right" expand={true} richColors theme="dark" />;
}
