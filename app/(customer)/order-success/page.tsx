"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ArrowRight, Home, Search } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassCard";
import { BRAND_FULL } from "@/lib/constants";

function OrderSuccessContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const supabase = createClient();
    
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-2xl font-bold">{t.order.notFound}</h1>
        <Button asChild>
          <Link href="/">{t.order.backToHome}</Link>
        </Button>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const lines = order.order_items.map((item: any) => 
      `- ${item.product_name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    );

    const message = [
      `${t.whatsapp.newOrder} (${order.order_number}) - ${BRAND_FULL}`,
      "",
      `${t.whatsapp.items}:`,
      ...lines,
      "",
      `${t.whatsapp.total}: ${formatPrice(order.total)}`,
      "",
      `${t.whatsapp.name}: ${order.name}`,
      `${t.whatsapp.phone}: ${order.phone}`,
      `${t.whatsapp.address}: ${order.address}`,
      `${t.whatsapp.notes}: ${order.notes || "-"}`,
    ].join("\n");

    const encoded = encodeURIComponent(message);
    const whatsappPhone = "213555123456"; // Future: Fetch from restaurant settings
    window.open(`https://wa.me/${whatsappPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-10 py-10">
      <div className="flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </motion.div>
        
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gradient mb-4">
            {t.order.success}
          </h1>
          <p className="text-muted text-lg font-medium">
            {t.checkout.finalDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-8 border-primary/20 flex flex-col items-center text-center gap-2">
          <p className="text-xs font-black uppercase tracking-widest text-muted">{t.order.number}</p>
          <p className="text-4xl font-black text-primary glow-primary tracking-tighter">
            {order.order_number}
          </p>
        </GlassCard>

        <GlassCard className="p-8 border-white/10 flex flex-col items-center text-center gap-2">
          <p className="text-xs font-black uppercase tracking-widest text-muted">{t.order.eta}</p>
          <p className="text-3xl font-black tracking-tighter">
            {t.order.etaVal}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-8 border-white/5">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted mb-6">{t.order.summary}</h3>
        <ul className="flex flex-col gap-4 mb-6">
          {order.order_items.map((item: any) => (
            <li key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-foreground">{item.product_name}</span>
                <span className="text-[10px] text-muted uppercase font-bold">Qty: {item.quantity}</span>
              </div>
              <span className="font-black">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="h-px bg-white/5 my-4" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-black">{t.cart.total}</span>
          <span className="text-2xl font-black text-primary glow-primary">{formatPrice(order.total)}</span>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleWhatsApp}
            size="lg" 
            className="h-16 rounded-2xl bg-[#25D366] text-white font-black shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
          >
            <MessageCircle className="h-6 w-6" />
            {t.checkout.sendWhatsapp}
          </Button>
          <Button 
            asChild
            variant="glass"
            size="lg" 
            className="h-16 rounded-2xl font-bold gap-3"
          >
            <Link href="/track-order">
              <Search className="h-5 w-5" />
              {t.order.track}
            </Link>
          </Button>
        </div>
        
        <Button asChild variant="ghost" className="h-14 font-bold text-muted hover:text-foreground">
          <Link href="/">
            <Home className="h-5 w-5 mr-2" />
            {t.order.backToHome}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
