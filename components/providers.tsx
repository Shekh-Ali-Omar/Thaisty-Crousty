"use client";

import { LocaleProvider } from "@/components/locale-provider";
import { RealtimeManager } from "@/components/admin/RealtimeManager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      {children}
      <RealtimeManager />
    </LocaleProvider>
  );
}
