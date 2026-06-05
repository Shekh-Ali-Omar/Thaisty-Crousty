"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { locales, type Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/glass/GlassCard";

const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export default function ProfilePage() {
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="flex flex-col gap-6 py-2">
      <h1 className="text-3xl font-bold text-gradient">{t.profile.title}</h1>

      <GlassCard className="p-5">
        <h2 className="mb-3 text-sm font-medium text-muted">
          {t.profile.language}
        </h2>
        <div className="flex flex-col gap-2">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              className={cn(
                "flex h-12 items-center rounded-xl px-4 text-start transition-all duration-200",
                locale === loc
                  ? "glass-glow text-primary font-semibold"
                  : "glass hover:glass-strong text-foreground"
              )}
            >
              {localeLabels[loc]}
            </button>
          ))}
        </div>
      </GlassCard>

      <Button asChild variant="outline" className="w-full">
        <Link href="/admin">
          <Shield className="h-5 w-5" />
          {t.profile.admin}
        </Link>
      </Button>
    </div>
  );
}
