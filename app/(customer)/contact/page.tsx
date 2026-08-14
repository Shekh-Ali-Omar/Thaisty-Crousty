"use client";

import { Phone, MessageCircle, Mail, Camera, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/locale-provider";

export default function ContactPage() {
  const { t, locale } = useLocale();
  const [submitted, setSubmitted] = useState(false);

  const methods = [
    { Icon: Phone, label: locale === "fr" ? "APPELEZ-NOUS" : locale === "ar" ? "اتصل بنا" : "CALL US", value: "0X XX XX XX XX", href: "tel:+000000000" },
    { Icon: MessageCircle, label: "WHATSAPP", value: locale === "fr" ? "Commande & support" : locale === "ar" ? "الطلب والدعم" : "Order & support", href: "https://wa.me/" },
    { Icon: Mail, label: locale === "fr" ? "E-MAIL" : locale === "ar" ? "البريد الإلكتروني" : "EMAIL", value: "hello@thaisty.com", href: "mailto:hello@thaisty.com" },
    { Icon: Camera, label: "INSTAGRAM", value: "@thaistycrousty", href: "#" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="t-grain border-b-2 border-[#F58220] bg-[#0a0a0a] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full">
          <p className="t-kicker text-[#F58220]">
            {locale === "fr" ? "NOUS RÉPONDONS VITE" : locale === "ar" ? "نرد بسرعة" : "WE ANSWER FAST"}
          </p>
          <h1 className="t-display mt-3 text-[15vw] leading-[0.78] md:text-[9vw] text-white">
            {locale === "fr" ? (
              <>NOUS <span className="text-[#F58220]">CONTACTER.</span></>
            ) : locale === "ar" ? (
              <>تواصل <span className="text-[#F58220]">معنا.</span></>
            ) : (
              <>GET IN <span className="text-[#F58220]">TOUCH.</span></>
            )}
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-12 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map(({ Icon, label, value, href }, idx) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, borderColor: "#F58220" }}
              className="t-panel flex items-center gap-4 p-5 transition-colors group"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center bg-[#F58220] text-[#0a0a0a] group-hover:scale-105 transition-transform">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="t-kicker block text-white/50">{label}</span>
                <span className="block truncate font-barlow-condensed font-bold text-2xl uppercase text-white group-hover:text-[#F58220] transition-colors">{value}</span>
              </span>
            </motion.a>
          ))}
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="t-panel mt-10 p-5 md:p-8" 
          onSubmit={handleSubmit}
        >
          <h2 className="t-display text-3xl text-white uppercase">{locale === "fr" ? "ENVOYER UN MESSAGE" : locale === "ar" ? "إرسال رسالة" : "SEND A MESSAGE"}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="t-label" htmlFor="ct-name">
                {t.checkout?.name || "Name"}
              </label>
              <input 
                id="ct-name" 
                required
                className="t-field" 
                placeholder={locale === "fr" ? "Votre nom" : locale === "ar" ? "اسمك" : "Your name"} 
              />
            </div>
            <div>
              <label className="t-label" htmlFor="ct-phone">
                {t.checkout?.phone || "Phone"}
              </label>
              <input 
                id="ct-phone" 
                type="tel" 
                required
                className="t-field" 
                placeholder="0X XX XX XX XX" 
              />
            </div>
          </div>
          <div className="mt-5">
            <label className="t-label" htmlFor="ct-msg">
              {locale === "fr" ? "Message" : locale === "ar" ? "الرسالة" : "Message"}
            </label>
            <textarea 
              id="ct-msg" 
              rows={4} 
              required
              className="t-field py-3" 
              placeholder={locale === "fr" ? "Comment pouvons-nous vous aider ?" : locale === "ar" ? "كيف يمكننا مساعدتك؟" : "How can we help?"} 
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className={`t-btn mt-6 transition-all ${submitted ? "!bg-green-500 !text-black !border-green-500" : ""}`}
          >
            {submitted ? (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 stroke-[3]" /> {locale === "fr" ? "MESSAGE ENVOYÉ!" : locale === "ar" ? "تم الإرسال!" : "MESSAGE SENT!"}
              </span>
            ) : (
              <>{locale === "fr" ? "ENVOYER" : locale === "ar" ? "إرسال" : "SEND"} <span className="t-arrow rtl:-scale-x-100">→</span></>
            )}
          </motion.button>
        </motion.form>
      </section>
    </div>
  );
}
