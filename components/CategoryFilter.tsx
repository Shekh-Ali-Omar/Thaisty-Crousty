"use client";

import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { motion } from "framer-motion";

type Props = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ active, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        const label = (t.menu.categories as Record<string, string>)[cat] || cat;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "t-btn-quiet shrink-0 snap-center relative transition-colors duration-200",
              isActive
                ? "text-[#F58220]"
                : "text-white/70 hover:text-white"
            )}
          >
            {label}
            {isActive && (
              <motion.span
                layoutId="activeCategoryTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F58220]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
