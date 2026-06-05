"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 left-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] md:bottom-10 md:left-10"
      aria-label="Contact on WhatsApp"
    >
      <div className="absolute inset-0 animate-pulse rounded-2xl bg-[#25D366] opacity-50 blur-lg" />
      <MessageCircle className="relative h-7 w-7 fill-white" />
    </motion.a>
  );
}
