"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/components/locale-provider";

const getFaqs = (locale: string) => {
  if (locale === "fr") return [
    ["Quelles sont vos heures de livraison ?", "Nous livrons tous les jours de 11h00 à 23h30."],
    ["Combien de temps prend la livraison ?", "Généralement 30 à 40 minutes selon votre secteur et le trafic."],
    ["À quel point la sauce piquante est-elle forte ?", "Moyennement forte. Vous pouvez demander très piquant dans les notes de commande."],
    ["Puis-je payer par carte ?", "Oui — la carte et le paiement à la livraison sont disponibles à la caisse."],
    ["Avez-vous des informations sur les allergènes ?", "Demandez-nous sur WhatsApp avant de commander et nous confirmerons pour chaque bol."],
    ["Puis-je récupérer ma commande ?", "Oui, choisissez 'À emporter' à la caisse et récupérez au comptoir."],
  ];
  if (locale === "ar") return [
    ["ما هي ساعات التوصيل؟", "نقوم بالتوصيل كل يوم من الساعة 11:00 إلى 23:30."],
    ["كم من الوقت يستغرق التوصيل؟", "عادة 30-40 دقيقة حسب منطقتك وحركة المرور."],
    ["ما مدى حرارة الصلصة الحارة؟", "حارة متوسطة. يمكنك طلب إضافة المزيد من الحرارة في ملاحظات الطلب."],
    ["هل يمكنني الدفع بالبطاقة؟", "نعم — تتوفر كل من البطاقة والدفع عند الاستلام عند الدفع."],
    ["هل لديكم معلومات عن مسببات الحساسية؟", "اسألنا على الواتساب قبل الطلب وسنقوم بتأكيد كل وعاء."],
    ["هل يمكنني استلام طلبي؟", "نعم، اختر الاستلام عند الدفع واستلم من الشباك."],
  ];
  return [
    ["What are your delivery hours?", "We deliver every day from 11:00 to 23:30."],
    ["How long does delivery take?", "Usually 30–40 minutes depending on your area and traffic."],
    ["How spicy is the spicy sauce?", "Medium-hot. You can request extra spicy in the order notes."],
    ["Can I pay by card?", "Yes — card and cash on delivery are both available at checkout."],
    ["Do you have allergen info?", "Ask us on WhatsApp before ordering and we'll confirm per bowl."],
    ["Can I pick up my order?", "Yes, choose pickup at checkout and collect at our counter."],
  ];
};

export default function FaqPage() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  // Use translations if available, fallback to default FAQs
  const localizedFaqs = t.faq?.questions?.map((q: any) => ({ question: q.q, answer: q.a })) || getFaqs(locale).map(f => ({ question: f[0], answer: f[1] }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="t-grain border-b-2 border-[#F58220] bg-[#0a0a0a] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full">
          <p className="t-kicker text-[#F58220]">
            {locale === "fr" ? "BONNES QUESTIONS" : locale === "ar" ? "أسئلة جيدة" : "GOOD QUESTIONS"}
          </p>
          <h1 className="t-display mt-3 text-[15vw] leading-[0.78] md:text-[9vw] text-white">
            {t.faq?.title || "FAQ"}
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-12 md:px-8">
        <div className="divide-y-2 divide-[#1a1a1a] border-y-2 border-[#1a1a1a]">
          {localizedFaqs.map((faq: { question: string, answer: string }, i: number) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-start group transition-colors"
                >
                  <span className={`font-barlow-condensed text-2xl font-bold uppercase transition-colors ${isOpen ? "text-[#F58220]" : "text-white group-hover:text-[#F58220]"}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isOpen ? (
                      <Minus className="h-6 w-6 shrink-0 text-[#F58220]" />
                    ) : (
                      <Plus className="h-6 w-6 shrink-0 text-[#F58220] group-hover:scale-110 transition-transform" />
                    )}
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <p className="pb-5 font-barlow-condensed text-lg uppercase text-white/60 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <Link 
          href="/contact" 
          className="t-btn mt-10"
        >
          {locale === "fr" ? "ENCORE BESOIN D'AIDE" : locale === "ar" ? "هل ما زلت بحاجة للمساعدة" : "STILL NEED HELP"} <span className="t-arrow rtl:-scale-x-100">→</span>
        </Link>
      </section>
    </div>
  );
}
