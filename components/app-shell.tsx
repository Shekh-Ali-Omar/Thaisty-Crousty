"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { StickyCartButton } from "@/components/StickyCartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();
  const isHome = pathname === "/";
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
      
      <main className="relative w-full min-h-screen flex-1 pb-32 md:pb-0">
        {children}
      </main>

      <StickyCartButton />
      <CartDrawer />
      <BottomNav />
      <Footer />
    </>
  );
}
