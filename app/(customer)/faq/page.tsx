"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { GlassCard } from "@/components/glass/GlassCard";

export default function FAQPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-16 pb-20">
      <section className="text-center max-w-3xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-primary mb-6"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">{t.faq.supportTag}</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-gradient mb-8"
        >
          {t.faq.title}
        </motion.h1>
      </section>

      <section className="max-w-3xl mx-auto w-full flex flex-col gap-4">
        {t.faq.questions.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-8 flex flex-col gap-4 group cursor-pointer hover:bg-white/[0.02] transition-all">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {faq.q}
                </h3>
                <ChevronDown className="h-6 w-6 text-muted group-hover:text-primary transition-colors shrink-0" />
              </div>
              <p className="text-muted leading-relaxed font-medium">
                {faq.a}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      {/* Still have questions? */}
      <section className="text-center py-12">
        <GlassCard className="p-10 max-w-xl mx-auto border-primary/10">
          <h3 className="text-2xl font-black mb-4 tracking-tight">{t.faq.more.title}</h3>
          <p className="text-muted mb-8 font-medium">
            {t.faq.more.desc}
          </p>
          <a 
            href="/contact" 
            className="h-14 px-10 rounded-2xl bg-primary text-black font-black inline-flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            {t.faq.more.button}
          </a>
        </GlassCard>
      </section>
    </div>
  );
}
