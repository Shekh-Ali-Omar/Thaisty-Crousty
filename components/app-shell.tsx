"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { StickyCartButton } from "@/components/StickyCartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Dynamic Ambient Background */}
      <div className="mesh-bg" aria-hidden />
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full animate-float" style={{ animationDelay: "-2s" }} />
      </div>

      <Navbar />
      
      <main className="relative mx-auto min-h-screen w-full max-w-6xl flex-1 px-4 pb-32 pt-24 md:pb-8 md:pt-32">
        {children}
      </main>

      <StickyCartButton />
      <CartDrawer />
      <BottomNav />
      <WhatsAppButton />
      <Footer />
    </>
  );
}
