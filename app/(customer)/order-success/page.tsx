"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { BRAND_FULL } from "@/lib/constants";

function OrderSuccessContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

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
      <div className="flex min-h-screen bg-[#0a0a0a] items-center justify-center pt-[68px]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#F58220]/20 border-t-[#F58220]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a] pt-[68px] flex-col items-center justify-center gap-6 text-center">
        <h1 className="t-display text-4xl text-white">{t.order.notFound}</h1>
        <Link 
          href="/" 
          className="t-btn"
        >
          {t.order.backToHome}
        </Link>
      </div>
    );
  }

  const handleWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const lines = (order.order_items as { product_name: string; quantity: number; price: number }[]).map((item) =>
      `- ${item.product_name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    );

    const message = [
      `${t.whatsapp.newOrder} (${order.order_number}) - ${BRAND_FULL}`,
      "",
      `${t.whatsapp.items}:`,
      ...lines,
      "",
      `${t.whatsapp.total}: ${formatPrice(Number(order.total))}`,
      "",
      `${t.whatsapp.name}: ${String(order.name)}`,
      `${t.whatsapp.phone}: ${String(order.phone)}`,
      `${t.whatsapp.address}: ${String(order.address)}`,
      `${t.whatsapp.notes}: ${String(order.notes || "-")}`,
    ].join("\n");

    const encoded = encodeURIComponent(message);
    const whatsappPhone = "213555123456"; // Future: Fetch from restaurant settings
    window.open(`https://wa.me/${whatsappPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="t-grain border-b-4 border-[#F58220] bg-[#0a0a0a] px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto w-full">
          <span className="t-sticker-acid -rotate-3 text-lg">
            {locale === "ar" ? "مؤكد" : locale === "fr" ? "CONFIRMÉ" : "CONFIRMED"}
          </span>
          <h1 className="t-display mt-4 text-[16vw] leading-[0.85] md:text-[8vw] text-white">
            {locale === "ar" ? (<>تم تثبيت<br /><span className="text-[#F58220]">الطلب.</span></>) : locale === "fr" ? (<>COMMANDE<br /><span className="text-[#F58220]">VALIDÉE.</span></>) : (<>ORDER<br />LOCKED <span className="text-[#F58220]">IN.</span></>)}
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-10 md:px-8">
        <div className="t-panel p-5 md:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="t-label mb-1">
                {t.order.number}
              </p>
              <p className="t-display text-3xl text-white">#{String(order.order_number)}</p>
            </div>
            <div>
              <p className="t-label mb-1">
                {t.order.eta}
              </p>
              <p className="t-display text-3xl text-[#F58220]">{t.order.etaVal}</p>
            </div>
          </div>

          <ul className="mt-8 divide-y-2 divide-[#1a1a1a] border-t-2 border-[#1a1a1a]">
            {(order.order_items as { id: string; product_name: string; quantity: number; price: number }[]).map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3">
                <span className="font-barlow-condensed text-xl uppercase font-bold text-white/90">
                  {item.quantity} × {item.product_name}
                </span>
                <span className="t-display text-2xl text-white">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline justify-between border-t-2 border-[#1a1a1a] pt-6">
            <span className="t-display text-2xl text-white">{t.cart.total}</span>
            <span className="t-display text-4xl text-[#F58220]">{formatPrice(Number(order.total))}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link 
              href="/track-order" 
              className="t-btn flex-1"
            >
              {t.order.track} <span className="t-arrow rtl:-scale-x-100">→</span>
            </Link>
            <a 
              href="#"
              onClick={handleWhatsApp}
              className="t-btn-quiet md:w-auto"
            >
              {t.checkout.sendWhatsapp}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#0a0a0a] pt-[68px] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#F58220]/20 border-t-[#F58220]" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
