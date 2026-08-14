"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import {
  getCheckoutSchema,
  type CheckoutFormValues,
} from "@/lib/validations/order";
import { useHydrated } from "@/lib/hooks";
import { toast } from "sonner";

type Step = 0 | 1 | 2;

export default function CheckoutPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isHydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(() => getCheckoutSchema(t), [t]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { notes: "" },
  });

  const steps = [
    `01 — ${t.checkout.stepInfo}`,
    `02 — ${t.checkout.stepReview}`,
    `03 — ${t.checkout.stepConfirm}`,
  ];
  const deliveryFee = 2.00;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[68px] flex items-center justify-center">
         <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#F58220]/20 border-t-[#F58220]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
        <section className="mx-auto w-full px-4 py-16 md:px-8 text-center border-2 border-[#1a1a1a] mt-10 bg-[#111]">
          <h1 className="t-display text-6xl md:text-7xl text-white mb-6 uppercase">
            {locale === "fr" ? (
              <>VOTRE <span className="text-[#F58220]">PANIER</span> EST VIDE</>
            ) : locale === "ar" ? (
              <><span className="text-[#F58220]">عربة التسوق</span> الخاصة بك فارغة</>
            ) : (
              <>YOUR <span className="text-[#F58220]">CART</span> IS EMPTY</>
            )}
          </h1>
          <Link
            href="/menu"
            className="t-btn"
          >
            {t.common.back_to_menu} <span className="t-arrow rtl:-scale-x-100">→</span>
          </Link>
        </section>
      </div>
    );
  }

  const onConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const statusRes = await fetch("/api/restaurant-status");
      const statusData = await statusRes.json();

      if (!statusData.isOpen) {
        toast.error(statusData.message || "Restaurant is closed.");
        setError(statusData.message || "Restaurant is closed.");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...getValues(),
          items: items.map(i => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            note: i.note
          }))
        }),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        router.push(`/order-success?id=${result.order.id}`);
      } else {
        setError(result.error || t.common.error);
      }
    } catch (err) {
      console.error("[CHECKOUT_SUBMIT_ERROR]:", err);
      setError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="mx-auto w-full px-4 py-10 md:px-8 md:py-16">
        <h1 className="t-display text-5xl md:text-6xl text-white uppercase">
          {t.checkout.title}
        </h1>

        <ol className="mt-6 grid gap-2 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s}
              className={`border-2 px-3 py-2 t-kicker ${
                i === step
                  ? "border-[#F58220] bg-[#F58220] text-[#0a0a0a]"
                  : i < step
                    ? "border-[#F58220] text-[#F58220]"
                    : "border-[#1a1a1a] text-white/40"
              }`}
            >
              {s}
            </li>
          ))}
        </ol>

        <div className="t-panel mt-8 p-5 md:p-8">
          {step === 0 && (
            <form id="checkout-step-1" className="grid gap-5" onSubmit={handleSubmit(() => setStep(1))}>
              <div>
                <label className="t-label" htmlFor="co-name">
                  {t.checkout.name}
                </label>
                <input 
                  id="co-name" 
                  {...register("name")}
                  className="t-field" 
                  placeholder="Yacine B." 
                />
                {errors.name && <p className="mt-2 t-kicker text-[#F58220]">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="t-label" htmlFor="co-phone">
                  {t.checkout.phone}
                </label>
                <input 
                  id="co-phone" 
                  type="tel"
                  {...register("phone")}
                  className="t-field" 
                  placeholder="0X XX XX XX XX" 
                />
                {errors.phone && <p className="mt-2 t-kicker text-[#F58220]">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="t-label" htmlFor="co-addr">
                  {t.checkout.address}
                </label>
                <input 
                  id="co-addr" 
                  {...register("address")}
                  className="t-field" 
                  placeholder="Street, building, floor" 
                />
                {errors.address && <p className="mt-2 t-kicker text-[#F58220]">{errors.address.message}</p>}
              </div>

              <div>
                <label className="t-label" htmlFor="co-notes">
                  {t.checkout.notes}
                </label>
                <textarea 
                  id="co-notes" 
                  rows={3}
                  {...register("notes")}
                  className="t-field py-3" 
                  placeholder="Extra spicy…" 
                />
              </div>
            </form>
          )}

          {step === 1 && (
            <div>
              <h2 className="t-display text-3xl text-white uppercase">{t.checkout.orderDetails}</h2>
              <ul className="mt-5 divide-y-2 divide-white/10">
                {items.map((i) => (
                  <li key={i.productId} className="flex items-center justify-between gap-4 py-3">
                    <span className="font-condensed text-lg font-bold uppercase text-white/90">{i.quantity} × {i.name}</span>
                    <span className="t-display text-2xl text-white">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="font-condensed text-lg font-bold uppercase text-white/50">{locale === "fr" ? "Livraison" : locale === "ar" ? "التوصيل" : "Delivery"}</span>
                  <span className="t-display text-2xl text-white/50">{formatPrice(deliveryFee)}</span>
                </li>
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t-2 border-white/10 pt-4">
                <span className="t-display text-2xl text-white">{t.cart.total}</span>
                <span className="t-display text-3xl text-[#F58220]">{formatPrice(total + deliveryFee)}</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="t-display text-3xl text-white uppercase">{t.checkout.finalConfirm}</h2>
              <p className="mt-3 opacity-80 text-white font-condensed uppercase tracking-wide">
                {t.checkout.finalDesc}
              </p>
              <p className="mt-6 t-display text-4xl text-[#F58220]">{formatPrice(total + deliveryFee)}</p>
              
              {error && (
                <div className="mt-6 p-4 border border-[#F58220] bg-[#F58220]/10 text-[#F58220] t-kicker">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {step > 0 && (
              <button 
                type="button" 
                onClick={() => setStep((step - 1) as Step)} 
                className="t-btn-quiet"
                disabled={submitting}
              >
                {t.checkout.back}
              </button>
            )}
            
            {step === 0 && (
              <button 
                form="checkout-step-1"
                type="submit" 
                className="t-btn flex-1"
              >
                {locale === "fr" ? "CONTINUER" : locale === "ar" ? "استمر" : "CONTINUE"} <span className="t-arrow rtl:-scale-x-100">→</span>
              </button>
            )}

            {step === 1 && (
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="t-btn flex-1"
              >
                {t.checkout.stepConfirm} <span className="t-arrow rtl:-scale-x-100">→</span>
              </button>
            )}

            {step === 2 && (
              <button 
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="t-btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.checkout.placing : (locale === "fr" ? "PASSER LA COMMANDE" : locale === "ar" ? "تأكيد الطلب" : "PLACE ORDER")} <span className="t-arrow rtl:-scale-x-100">→</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
