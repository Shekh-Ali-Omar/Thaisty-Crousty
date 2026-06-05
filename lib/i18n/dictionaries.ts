import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import ar from "@/messages/ar.json";

export type Locale = "en" | "fr" | "ar";

export const locales: Locale[] = ["en", "fr", "ar"];

export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = {
  en: en as Dictionary,
  fr: fr as Dictionary,
  ar: ar as Dictionary,
};

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  
  // 1. Check if user has a saved preference
  const stored = localStorage.getItem("thaisty-locale") as Locale | null;
  if (stored && locales.includes(stored)) return stored;

  // 2. Check browser languages
  const languages = navigator.languages || [navigator.language];
  
  for (const lang of languages) {
    const l = lang.toLowerCase();
    if (l.startsWith("ar")) return "ar";
    if (l.startsWith("fr")) return "fr";
    if (l.startsWith("en")) return "en";
  }

  return "en";
}
