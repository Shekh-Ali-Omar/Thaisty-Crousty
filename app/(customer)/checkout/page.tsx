"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, MessageCircle } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cn } from "@/lib/utils";
import {
  getCheckoutSchema,
  type CheckoutFormValues,
} from "@/lib/validations/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/glass/GlassCard";
import { useHydrated } from "@/lib/hooks";
import { submitOrder } from "@/lib/whatsapp";
import { useMemo } from "react";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const { t, locale } = useLocale();
  const isHydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const [step, setStep] = useState<Step>(1);
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

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-lg flex flex-col gap-6 opacity-0">
        <h1 className="text-3xl font-bold">{t.checkout.title}</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-24 text-center glass-premium rounded-[2.5rem] px-6 max-w-2xl mx-auto">
        <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center animate-float">
          <ShoppingBag className="h-10 w-10 text-muted" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">{t.cart.empty}</h2>
          <p className="text-muted font-medium">{t.cart.emptySubtitle}</p>
        </div>
        <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.3)]">
          <Link href="/menu">{t.menu.title}</Link>
        </Button>
      </div>
    );
  }

  const steps = [
    t.checkout.stepInfo,
    t.checkout.stepReview,
    t.checkout.stepConfirm,
  ];

  const onConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const success = await submitOrder({
        customer: getValues() as any,
        items,
        total,
        t,
      });
      if (success) {
        clearCart();
      } else {
        setError(t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-10">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gradient">{t.checkout.title}</h1>
        <p className="text-muted font-bold tracking-widest uppercase text-xs">{t.checkout.subtitle}</p>
      </div>

      <div className="flex items-center gap-4 px-2">
        {steps.map((label, i) => {
          const n = (i + 1) as Step;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <div key={label} className="flex-1 flex flex-col gap-3">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  isActive ? "bg-primary shadow-[0_0_15px_rgba(255,140,0,0.6)]" : 
                  isDone ? "bg-primary/40" : "bg-white/5"
                )}
              />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest text-center transition-colors",
                isActive ? "text-primary" : "text-muted"
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard className="p-10 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit(() => setStep(2))}
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.checkout.name}</Label>
                <Input id="name" {...register("name")} className="h-14 rounded-xl glass border-white/5 focus:border-primary/40 transition-all" />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400 font-bold ms-1">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.checkout.phone}</Label>
                <Input id="phone" type="tel" {...register("phone")} className="h-14 rounded-xl glass border-white/5 focus:border-primary/40 transition-all" />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-400 font-bold ms-1">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.checkout.address}</Label>
                <Input id="address" {...register("address")} className="h-14 rounded-xl glass border-white/5 focus:border-primary/40 transition-all" />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-400 font-bold ms-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted ms-1">{t.checkout.notes}</Label>
                <Textarea id="notes" {...register("notes")} className="min-h-[100px] rounded-xl glass border-white/5 focus:border-primary/40 transition-all pt-4" />
              </div>
              <Button type="submit" size="lg" className="h-16 rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                {t.checkout.review}
                <ArrowRight className={cn(locale === "ar" ? "mr-2 rotate-180" : "ml-2", "h-5 w-5")} />
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
          <GlassCard className="p-8 border-primary/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted mb-4">{t.checkout.deliveryInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-widest mb-1">{t.checkout.customer}</p>
                <p className="font-black text-lg">{getValues("name")}</p>
                <p className="text-muted font-medium">{getValues("phone")}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-widest mb-1">{t.checkout.address}</p>
                <p className="font-bold">{getValues("address")}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted mb-6">{t.checkout.orderDetails}</h3>
            <ul className="space-y-4 mb-8">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold">{i.name}</span>
                    <span className="text-xs text-muted font-bold">{t.checkout.qty}: {i.quantity}</span>
                  </div>
                  <span className="font-black tracking-tight">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="h-px bg-white/5 my-4" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-black">{t.cart.total}</span>
              <span className="text-3xl font-black text-primary glow-primary tracking-tighter">
                {formatPrice(total)}
              </span>
            </div>
          </GlassCard>

          <div className="flex gap-4">
            <Button variant="glass" className="h-16 flex-1 rounded-2xl font-bold" onClick={() => setStep(1)}>
              {t.checkout.back}
            </Button>
            <Button className="h-16 flex-[2] rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.35)]" onClick={() => setStep(3)}>
              {t.checkout.stepConfirm}
              <ArrowRight className={cn(locale === "ar" ? "mr-2 rotate-180" : "ml-2", "h-5 w-5")} />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-8 text-center py-10">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-12 w-12 text-primary glow-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-4">{t.checkout.finalConfirm}</h2>
            <p className="text-muted max-w-sm mx-auto font-medium leading-relaxed">
              {t.checkout.finalDesc}
            </p>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
            <Button
              className="h-16 w-full rounded-2xl bg-primary text-black font-black shadow-[0_8px_40px_rgba(255,140,0,0.4)] text-lg"
              disabled={submitting}
              onClick={onConfirm}
            >
              {submitting ? t.checkout.placing : t.checkout.sendWhatsapp}
            </Button>
            <Button variant="glass" className="h-14 w-full rounded-2xl font-bold" onClick={() => setStep(2)} disabled={submitting}>
              {t.checkout.back}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
