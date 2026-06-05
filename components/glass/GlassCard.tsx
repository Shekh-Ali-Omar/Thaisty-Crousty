"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = HTMLMotionProps<"div"> & {
  strong?: boolean;
  glow?: boolean;
};

export function GlassCard({
  className,
  strong,
  glow,
  children,
  ...props
}: Props) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl",
        strong ? "glass-strong" : "glass",
        glow && "glass-glow",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
