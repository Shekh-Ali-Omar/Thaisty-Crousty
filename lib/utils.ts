import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-DZ")} DA`;
}

export function parsePrice(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

export const glassCard = cn(
  "glass rounded-2xl transition-all duration-200",
  "hover:border-white/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
);

export const glassPill = cn(
  "glass rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
);
