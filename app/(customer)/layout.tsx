import { AppShell } from "@/components/app-shell";
import { Anton, Barlow_Condensed, Barlow, Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import "./customer.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
});

const barlow = Barlow({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const alexandria = Alexandria({
  weight: ["700", "900"],
  subsets: ["arabic"],
  variable: "--font-alexandria",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-sans-arabic",
});

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "customer-theme bg-[#0a0a0a] text-white min-h-screen relative w-full flex flex-col",
      anton.variable,
      barlowCondensed.variable,
      barlow.variable,
      alexandria.variable,
      ibmPlexSansArabic.variable
    )}>
      <AppShell>{children}</AppShell>
    </div>
  );
}
