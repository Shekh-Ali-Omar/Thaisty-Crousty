"use client";

import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { cn, glassPill } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

type Props = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ active, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        const label = (t.menu.categories as any)[cat] || cat;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              glassPill,
              "shrink-0 min-h-11 capitalize",
              isActive
                ? "glass-glow bg-primary/20 text-primary border-primary/30 font-semibold"
                : "text-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
