"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  detectLocale,
  dictionaries,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { useHydrated } from "@/lib/hooks";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "thaisty-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const isHydrated = useHydrated();

  useEffect(() => {
    if (isHydrated) {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored ?? detectLocale());
    }
  }, [isHydrated]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, isHydrated]);

  const value: LocaleContextValue = {
    locale,
    setLocale,
    t: dictionaries[locale],
    dir: locale === "ar" ? "rtl" : "ltr",
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "fr" as Locale,
      setLocale: () => {},
      t: dictionaries.fr,
      dir: "ltr" as const,
    };
  }
  return ctx;
}
