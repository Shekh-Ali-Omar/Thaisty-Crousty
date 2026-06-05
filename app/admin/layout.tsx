import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/admin" className="font-bold text-primary">
            {BRAND_NAME} Admin
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← Store
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
