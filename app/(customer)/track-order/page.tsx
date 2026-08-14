"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle2, 
  Flame, 
  Package, 
  Truck, 
  Check, 
  AlertCircle,
  RotateCcw
} from "lucide-react";

const STAGES = ["pending", "confirmed", "preparing", "ready", "delivered"] as const;
type Stage = typeof STAGES[number];

const STAGE_META: Record<
  Stage, 
  { 
    icon: typeof Clock;
    label: { en: string; fr: string; ar: string };
    desc: { en: string; fr: string; ar: string };
  }
> = {
  pending: {
    icon: Clock,
    label: { en: "Order Received", fr: "Commande Reçue", ar: "تم استلام الطلب" },
    desc: {
      en: "Your order is recorded and waiting for kitchen approval.",
      fr: "Votre commande est enregistrée et en attente de validation.",
      ar: "تم استلام وتسجيل طلبك وهو بانتظار تأكيد المطبخ."
    }
  },
  confirmed: {
    icon: CheckCircle2,
    label: { en: "Confirmed", fr: "Confirmée", ar: "تم التأكيد" },
    desc: {
      en: "Confirmed by our crew in Dely Ibrahim. Ingredients ready.",
      fr: "Confirmée par l'équipe à Dely Ibrahim. Ingrédients prêts.",
      ar: "تم تأكيد طلبك من طاقم العمل في فرع دالي إبراهيم."
    }
  },
  preparing: {
    icon: Flame,
    label: { en: "In Kitchen", fr: "En Cuisine", ar: "قيد التحضير" },
    desc: {
      en: "Fried fresh to order — chicken is crisping up right now.",
      fr: "Frit à la commande — poulet croustillant et sauces maison en cours.",
      ar: "يقوم الطهاة بقلي الدجاج الطازج وإعداد الوجبة الساخنة الآن."
    }
  },
  ready: {
    icon: Package,
    label: { en: "Ready for Delivery", fr: "Prête pour Livraison", ar: "جاهز للتوصيل" },
    desc: {
      en: "Packed hot in insulated boxes and handed to our rider.",
      fr: "Emballé bien chaud dans sa boîte hermétique et remis au livreur.",
      ar: "تم تغليف الوجبة ساخنة ومحكمة وجاهزة للتسليم لمندوب التوصيل."
    }
  },
  delivered: {
    icon: Truck,
    label: { en: "Delivered", fr: "Livrée", ar: "تم التوصيل" },
    desc: {
      en: "Order arrived! Enjoy the legendary Thaisty crunch.",
      fr: "Commande livrée ! Bon appétit et profitez du crunch.",
      ar: "وصل طلبك! بالهناء والشفاء واستمتع بألذ قرمشة."
    }
  },
};

const TRACK_TEXT = {
  tracking: { en: "TRACKING", fr: "SUIVI", ar: "تتبع الطلب" },
  trackYourBowl: { en: "TRACK YOUR BOWL", fr: "SUIVEZ VOTRE COMMANDE", ar: "تتبع وجبتك المقرمشة" },
  onThe: { en: "ON THE", fr: "EN", ar: "في الطريق" },
  way: { en: "WAY.", fr: "ROUTE.", ar: "إليك." },
  orderNumber: { en: "ORDER NUMBER", fr: "N° DE COMMANDE", ar: "رقم الطلب" },
  phoneNumber: { en: "PHONE NUMBER", fr: "N° DE TÉLÉPHONE", ar: "رقم الهاتف" },
  trackNow: { en: "TRACK NOW", fr: "SUIVRE", ar: "تتبع الطلب" },
  orderTimeline: { en: "ORDER TIMELINE", fr: "CHRONOLOGIE DE LA COMMANDE", ar: "المخطط الزمني للطلب" },
  status: { en: "STATUS:", fr: "STATUT :", ar: "المرحلة:" },
  nextStages: { en: "NEXT STAGES", fr: "ÉTAPES SUIVANTES", ar: "تكملة المسار" },
  currentStatus: { en: "CURRENT STATUS", fr: "STATUT ACTUEL", ar: "المرحلة الحالية" },
  orderDetails: { en: "ORDER DETAILS", fr: "DÉTAILS DE LA COMMANDE", ar: "تفاصيل الطلب" },
  date: { en: "DATE", fr: "DATE", ar: "التاريخ" },
  payment: { en: "PAYMENT", fr: "PAIEMENT", ar: "الدفع" },
  paid: { en: "PAID", fr: "PAYÉ", ar: "مدفوع" },
  cashOnDelivery: { en: "CASH ON DELIVERY", fr: "PAIEMENT À LA LIVRAISON", ar: "عند الاستلام" },
  address: { en: "ADDRESS", fr: "ADRESSE", ar: "العنوان" },
  items: { en: "ITEMS", fr: "ARTICLES", ar: "العناصر المطلوبة" },
  total: { en: "TOTAL", fr: "TOTAL", ar: "المجموع الكلي" },
  trackAnother: { en: "TRACK ANOTHER ORDER", fr: "SUIVRE UNE AUTRE COMMANDE", ar: "تتبع طلب آخر" },
} as const;

export default function TrackOrderPage() {
  const { t, locale, dir } = useLocale();
  const isRtl = locale === "ar" || dir === "rtl";
  const tx = (key: keyof typeof TRACK_TEXT) => TRACK_TEXT[key][locale] || TRACK_TEXT[key].en;

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
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
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .ilike("order_number", orderNumber.trim())
        .eq("phone", phone.trim())
        .single();

      if (fetchError || !data) {
        setError(
          locale === "ar" 
            ? "لم يتم العثور على الطلب. يرجى التأكد من رقم الطلب ورقم الهاتف." 
            : locale === "fr"
              ? "Commande introuvable. Veuillez vérifier le numéro et le téléphone."
              : "Order not found. Please verify your order number and phone."
        );
      } else {
        setOrder(data);
      }
    } catch {
      setError(t.common?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log("[TRACKING_REALTIME]: Order updated", payload);
          setOrder((current: Record<string, unknown> | null) => {
            if (!current) return null;
            return { ...current, ...payload.new };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const currentStatusIndex = STAGES.findIndex((s) => s === order?.status);
  const activeIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;
  const currentStage = STAGES[activeIndex] || "pending";
  const currentStageInfo = STAGE_META[currentStage];

  // Helper to render an individual stage node
  const renderStageNode = (stageKey: Stage, i: number) => {
    const isDone = i < activeIndex;
    const isActive = i === activeIndex;
    const stageMeta = STAGE_META[stageKey];
    const StageIcon = stageMeta.icon;
    const stageLabel = stageMeta.label[locale] || stageKey;

    return (
      <div className="flex flex-col items-center relative group shrink-0">
        {/* Pulsing ring on active */}
        {isActive && (
          <span className="absolute -inset-1.5 rounded-full bg-[#F58220]/25 animate-ping pointer-events-none" />
        )}

        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className={`relative z-10 grid h-11 w-11 sm:h-12 sm:w-12 md:h-16 md:w-16 place-items-center rounded-full border-2 transition-all duration-300 ${
            isActive
              ? "border-[#F58220] bg-[#F58220] text-[#0a0a0a] shadow-[0_0_20px_rgba(245,130,32,0.4)]"
              : isDone
                ? "border-[#F58220] bg-[#F58220] text-[#0a0a0a]"
                : "border-[#262626] bg-[#121212] text-white/30"
          }`}
        >
          {isDone ? (
            <Check className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 stroke-[3.5]" />
          ) : (
            <StageIcon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-7 md:w-7 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
          )}
        </motion.div>

        {/* Node Label underneath */}
        <div className="mt-2 text-center max-w-[85px] sm:max-w-[95px] md:max-w-[110px]">
          <span className={`block font-anton text-[10px] md:text-[13px] tracking-wider ${
            isActive ? "text-[#F58220]" : isDone ? "text-white/70" : "text-white/30"
          }`}>
            0{i + 1}
          </span>
          <span className={`block font-barlow-condensed text-[11px] sm:text-[12px] md:text-[15px] font-bold uppercase tracking-tight line-clamp-2 leading-tight ${
            isActive 
              ? "text-[#F58220] font-black" 
              : isDone 
                ? "text-white/85" 
                : "text-white/30"
          }`}>
            {stageLabel}
          </span>
        </div>
      </div>
    );
  };

  // Helper to render the connecting line
  const renderConnectorLine = (fromIndex: number) => {
    const isDone = fromIndex < activeIndex;
    const isActive = fromIndex === activeIndex;

    return (
      <div className="flex-1 mx-1.5 sm:mx-2 md:mx-4 h-[3px] bg-[#1a1a1a] relative overflow-hidden self-start mt-5 sm:mt-6 md:mt-8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isDone ? "100%" : isActive ? "50%" : "0%" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: fromIndex * 0.1 }}
          className={`h-full ${
            isDone 
              ? "bg-[#F58220]" 
              : isActive 
                ? "ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-[#F58220] to-transparent animate-pulse" 
                : "bg-transparent"
          }`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]" dir={isRtl ? "rtl" : "ltr"}>
      <section className="mx-auto w-full px-4 py-10 md:px-8 md:py-16">
        
        {/* Header Title */}
        <p className="t-kicker text-[#F58220]">
          {order ? (
            <span>
              {tx("tracking")} #{String(order.order_number)}
            </span>
          ) : (
            tx("trackYourBowl")
          )}
        </p>
        <h1 className="t-display mt-3 text-5xl md:text-7xl text-white">
          <>{tx("onThe")} <span className="text-[#F58220]">{tx("way")}</span></>
        </h1>

        {/* Search Form */}
        {!order ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 t-panel p-6 md:p-10"
          >
            <form onSubmit={handleTrack} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] items-end">
              <div>
                <label className="t-label mb-2 block">
                  {tx("orderNumber")}
                </label>
                <input
                  placeholder="TC-1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="t-field"
                  required
                />
              </div>
              <div>
                <label className="t-label mb-2 block">
                  {tx("phoneNumber")}
                </label>
                <input
                  type="tel"
                  placeholder="0555..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="t-field"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="t-btn disabled:opacity-50 disabled:hover:bg-[#F58220] h-12"
              >
                {loading ? (t.common?.loading || "LOADING...") : tx("trackNow")}
              </button>
            </form>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 font-barlow-condensed text-red-400 font-bold tracking-[0.08em] uppercase bg-red-500/10 p-4 border border-red-500/30 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 space-y-8"
          >
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* BRUTALIST TIMELINE (2-Row on Mobile, 1-Row on Desktop)             */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="t-panel p-5 sm:p-6 md:p-10 border-2 border-[#1a1a1a]">
              
              <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-[#1a1a1a]">
                <span className="font-barlow-condensed text-xs md:text-sm font-bold tracking-[0.2em] text-[#F58220] uppercase">
                  {tx("orderTimeline")}
                </span>
                <span className="font-barlow-condensed text-xs sm:text-sm font-bold tracking-wider text-white/50 uppercase">
                  {tx("status")} <span className="text-[#F58220]">{currentStageInfo.label[locale] || currentStage}</span>
                </span>
              </div>

              {/* ── DESKTOP TIMELINE (Single row for all 5 stages) ── */}
              <div className="hidden md:flex items-center justify-between w-full my-4 px-2">
                {STAGES.map((stageKey, i) => (
                  <div key={stageKey} className="flex-1 flex items-center last:flex-none">
                    {renderStageNode(stageKey, i)}
                    {i < STAGES.length - 1 && renderConnectorLine(i)}
                  </div>
                ))}
              </div>

              {/* ── MOBILE TIMELINE (Clean 2-row layout without scroll) ── */}
              <div className="flex md:hidden flex-col gap-6 my-2">
                {/* Row 1: Stages 01, 02, 03 */}
                <div className="flex items-center justify-between w-full">
                  {renderStageNode(STAGES[0], 0)}
                  {renderConnectorLine(0)}
                  {renderStageNode(STAGES[1], 1)}
                  {renderConnectorLine(1)}
                  {renderStageNode(STAGES[2], 2)}
                </div>

                {/* Subtle Divider / Continuation indicator */}
                <div className="flex items-center justify-center gap-2">
                  <span className="h-px flex-1 bg-[#1a1a1a]" />
                  <span className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
                    {tx("nextStages")}
                  </span>
                  <span className="h-px flex-1 bg-[#1a1a1a]" />
                </div>

                {/* Row 2: Stages 04, 05 */}
                <div className="flex items-center justify-center w-full px-6">
                  <div className="flex items-center justify-between w-full max-w-[280px]">
                    {renderStageNode(STAGES[3], 3)}
                    {renderConnectorLine(3)}
                    {renderStageNode(STAGES[4], 4)}
                  </div>
                </div>
              </div>

              {/* Active Stage Callout Card */}
              <div className="mt-8 p-4 sm:p-5 md:p-6 border border-[#F58220]/40 bg-[#F58220]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-[#F58220] animate-pulse" />
                    <span className="font-barlow-condensed text-xs font-bold tracking-[0.2em] text-[#F58220] uppercase">
                      {tx("currentStatus")}
                    </span>
                  </div>
                  <h3 className="font-anton text-xl sm:text-2xl md:text-3xl text-white">
                    {currentStageInfo.label[locale] || currentStage}
                  </h3>
                  <p className="mt-1 font-barlow-condensed text-sm sm:text-base md:text-lg text-white/70 font-medium leading-relaxed">
                    {currentStageInfo.desc[locale] || currentStageInfo.desc.en}
                  </p>
                </div>

                <div className="font-anton text-2xl md:text-3xl text-[#F58220] shrink-0 self-end md:self-center">
                  0{activeIndex + 1} / 05
                </div>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ORDER SUMMARY & RECEIPT DETAILS                                    */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="t-panel p-6">
                <h3 className="t-kicker text-white/50 mb-6">
                  {tx("orderDetails")}
                </h3>
                <div className="space-y-4 font-barlow-condensed text-lg uppercase text-white">
                  <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
                    <span className="text-white/50">{tx("date")}</span>
                    <span>{new Date(order.created_at as string).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
                    <span className="text-white/50">{tx("payment")}</span>
                    <span className={order.payment_status === "paid" ? "text-[#DFFF00]" : "text-[#F58220]"}>
                      {order.payment_status === "paid" 
                        ? tx("paid") 
                        : tx("cashOnDelivery")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">{tx("address")}</span>
                    <span className="text-right max-w-[220px] truncate">{String(order.address)}</span>
                  </div>
                </div>
              </div>

              <div className="t-panel p-6">
                <h3 className="t-kicker text-white/50 mb-6">
                  {tx("items")}
                </h3>
                <ul className="space-y-4 font-barlow-condensed text-lg uppercase text-white mb-6">
                  {((order.order_items as { id: string; product_name: string; quantity: number; price: number }[]) || []).map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>{i.product_name} × {i.quantity}</span>
                      <span>{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="h-px w-full bg-[#1a1a1a] my-4" />
                <div className="flex justify-between items-center font-barlow-condensed font-bold uppercase text-white">
                  <span className="text-xl">{tx("total")}</span>
                  <span className="t-display text-3xl text-[#F58220]">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>

            {/* Back action */}
            <div>
              <button
                type="button"
                onClick={() => setOrder(null)}
                className="t-btn-quiet text-white/60 hover:text-[#F58220] transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {tx("trackAnother")}
              </button>
            </div>

          </motion.div>
        )}
      </section>
    </div>
  );
}
