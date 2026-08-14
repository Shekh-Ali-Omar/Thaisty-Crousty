"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { motion } from "framer-motion";
import type { CategoryItem } from "@/lib/types";

type Props = {
  active: string;
  onChange: (category: string) => void;
  categories?: CategoryItem[];
};

export function CategoryFilter({ active, onChange, categories = [] }: Props) {
  const { t, locale } = useLocale();
  
  // Base 'All' category
  const allCategory = {
    slug: "all",
    label: (t.menu.categories as Record<string, string>)?.all || "All",
  };

  const dynamicCategories = categories.map(cat => ({
    slug: cat.slug,
    label: locale === "ar" ? (cat.name_ar || cat.name_en) : locale === "fr" ? (cat.name_fr || cat.name_en) : cat.name_en
  }));

  const displayCategories = [allCategory, ...dynamicCategories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
      {displayCategories.map(({ slug, label }) => {
        const isActive = active === slug;

        return (
          <button
            key={slug}
            type="button"
            onClick={() => onChange(slug)}
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
