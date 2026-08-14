"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useHydrated } from "@/lib/hooks";
import { useLocale } from "@/components/locale-provider";

const langs = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

export default function ProfilePage() {
  const isHydrated = useHydrated();
  const { t, locale, setLocale } = useLocale();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(!!profile?.is_admin);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[68px] flex items-center justify-center">
         <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#F58220]/20 border-t-[#F58220]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="mx-auto w-full px-4 py-10 md:px-8 md:py-16">
        <h1 className="t-display text-5xl md:text-6xl text-white">
          {locale === "fr" ? (
            <>VOTRE <span className="text-[#F58220]">PROFIL</span></>
          ) : locale === "ar" ? (
            <>الملف <span className="text-[#F58220]">الشخصي</span></>
          ) : (
            <>YOUR <span className="text-[#F58220]">PROFILE</span></>
          )}
        </h1>

        <div className="t-panel mt-8 p-5 md:p-8">
          <h2 className="t-display text-3xl text-white uppercase">{locale === "fr" ? "LANGUE" : locale === "ar" ? "اللغة" : "LANGUAGE"}</h2>
          
          <div
            className="mt-4 flex flex-wrap gap-2"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {langs.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                aria-pressed={locale === l.code}
                className={`t-btn-quiet ${
                  locale === l.code ? "bg-[#F58220] text-[#0a0a0a] border-[#F58220] hover:bg-white hover:border-white" : ""
                }`}
              >
                {l.code.toUpperCase()} · {l.label}
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link 
              href="/menu" 
              className="t-btn flex-1 md:flex-none"
            >
              {locale === "fr" ? "CONTINUER VOS ACHATS" : locale === "ar" ? "مواصلة التسوق" : "CONTINUE SHOPPING"} <span className="t-arrow rtl:-scale-x-100">→</span>
            </Link>
            <Link 
              href="/track-order" 
              className="t-btn-quiet flex-1 md:flex-none justify-center"
            >
              {locale === "fr" ? "MES COMMANDES" : locale === "ar" ? "طلباتي" : "MY ORDERS"}
            </Link>
          </div>

          {isAdmin && (
            <>
              <div className="h-px w-full bg-[#1a1a1a] my-10" />
              <h2 className="t-display text-4xl text-white uppercase flex items-center gap-3">
                <Shield className="h-8 w-8 text-[#F58220]" />
                {locale === "fr" ? "ADMINISTRATION" : locale === "ar" ? "الإدارة" : "ADMINISTRATION"}
              </h2>
              <p className="mt-2 font-barlow-condensed text-[16px] text-white/50 uppercase tracking-wide">
                {locale === "fr" ? "Vous avez les droits d'administrateur." : locale === "ar" ? "لديك صلاحيات المسؤول." : "You have admin privileges."}
              </p>
              <Link 
                href="/admin" 
                className="t-btn-quiet mt-6 inline-flex justify-center w-full md:w-auto"
                style={{ borderColor: "#F58220", color: "#F58220" }}
              >
                {locale === "fr" ? "OUVRIR LE PANNEAU D'ADMINISTRATION" : locale === "ar" ? "فتح لوحة الإدارة" : "OPEN ADMIN DASHBOARD"}
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
