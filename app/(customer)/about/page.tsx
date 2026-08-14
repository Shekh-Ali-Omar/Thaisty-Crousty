"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { resolveProductImageUrl } from "@/lib/image";

export default function AboutPage() {
  const { t, locale } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .limit(4);
      if (data) {
        setProducts(data as Product[]);
      }
    };
    fetchProducts();
  }, []);

  const rotations = ["rotate-2", "-rotate-2", "rotate-1", "-rotate-3"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <section className="t-grain border-b-2 border-[#F58220] bg-[#0a0a0a] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full">
          <p className="t-kicker text-[#F58220]">
            {locale === "ar" ? "البيان" : locale === "fr" ? "MANIFESTE" : "MANIFESTO"}
          </p>
          <h1 className="t-display mt-3 text-[15vw] leading-[0.78] md:text-[9vw] text-white">
            {locale === "ar" ? "نكهة تايلندية." : locale === "fr" ? "SAVEUR THAÏ." : "THAI FLAVOR."}
            <br />
            {locale === "ar" ? "أسلوب" : locale === "fr" ? "ATTITUDE" : "STREET"} <span className="text-[#F58220]">{locale === "ar" ? "الشارع." : locale === "fr" ? "DE RUE." : "ATTITUDE."}</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid w-full gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
        <div className="space-y-6 text-lg text-white/70">
          <p className="font-barlow-condensed text-3xl uppercase font-bold leading-tight text-white">
            {locale === "ar" ? "لم نفتح مطعماً. لقد افتتحنا مصنعاً للقرمشة." : locale === "fr" ? "Nous n'avons pas ouvert un restaurant. Nous avons ouvert une usine de croquant." : "We didn't open a restaurant. We opened a crunch factory."}
          </p>
          <p className="font-barlow-condensed text-lg uppercase tracking-wide">
            {locale === "ar" ? "يبدأ كل وعاء بدجاج مقلي عند الطلب، ثم يُدفن تحت صلصات نصنعها بأنفسنا — كاري، حلو، حار، أبيض. لا توجد مصابيح تدفئة، لا توجد طرق مختصرة، لا يوجد غلاف مبلل." : locale === "fr" ? "Chaque bol commence par du poulet frit à la commande, puis est enfoui sous des sauces que nous préparons maison — curry, sucrée, piquante, blanche. Pas de lampes chauffantes, pas de raccourcis, pas d'enrobage mou." : "Every bowl starts with chicken fried to order, then gets buried under sauces we build in-house — curry, sweet, spicy, white. No lamps, no shortcuts, no soggy coating."}
          </p>
          <p className="font-barlow-condensed text-lg uppercase tracking-wide">
            {locale === "ar" ? "تايستي صاخب عن قصد. أسود، برتقالي، خطوط ضخمة، وطعام كبير بما يكفي للنظر في عينيك. ستحبه اليوم، ستحبه غداً." : locale === "fr" ? "Thaisty est bruyant par choix. Noir, orange, polices énormes, et des portions assez grandes pour vous regarder dans les yeux. Tu aimes aujourd'hui, tu aimeras demain." : "Thaisty is loud on purpose. Black, orange, huge type, and food big enough to look you in the eye. You love it today, you'll love it tomorrow."}
          </p>
          <div className="pt-4">
            <Link 
              href="/menu" 
              className="t-btn text-xl"
            >
              {locale === "ar" ? "تناول الطعام معنا" : locale === "fr" ? "MANGEZ AVEC NOUS" : "EAT WITH US"} <span className="t-arrow rtl:-scale-x-100">→</span>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => {
            const product = products[i];
            const imgSrc = product ? resolveProductImageUrl(product.image_url || product.image) : null;
            return (
              <div
                key={i}
                className={`aspect-square overflow-hidden border-2 border-[#1a1a1a] bg-[#111] relative ${rotations[i]}`}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={product?.name_en || `Product ${i + 1}`}
                    fill
                    className="object-cover object-[50%_78%] hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 animate-pulse bg-[#1a1a1a]" />
                )}
              </div>
            );
          })}
        </div>
      </section>
      
      <div className="border-y-2 border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden py-4 mt-10">
        <div className="flex whitespace-nowrap opacity-50">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="t-display text-2xl text-white mx-4 tracking-wider">
              {locale === "ar" ? "مُقلى عند الطلب • صلصة كثيفة • لا يوجد بلل •" : locale === "fr" ? "FRIT À LA COMMANDE • RICHE EN SAUCE • PAS DE RAMOLLISSEMENT •" : "FRIED TO ORDER • SAUCE HEAVY • NO SOGGY • "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
