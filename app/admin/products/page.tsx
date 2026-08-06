"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";
import { GlassCard } from "@/components/glass/GlassCard";
import type { Product } from "@/lib/types";
import { RESTAURANT_ID, STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { logAction } from "@/lib/admin/activity";
import { useLocale } from "@/components/locale-provider";

export default function AdminProductsPage() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | "new">(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("restaurant_id", RESTAURANT_ID)
          .order("name");
        
        if (!error) {
          setProducts((data as Product[]) ?? []);
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deleteProduct = async (id: string) => {
    if (!confirm(t.admin.delete + "?")) return;
    
    const product = products.find(p => p.id === id);
    const supabase = createClient();

    // 1. Cleanup Storage Assets
    if (product) {
      const allImages = Array.from(new Set([
        product.image,
        ...(product.images || [])
      ])).filter(Boolean) as string[];

      const paths = allImages.map(url => {
        const parts = url.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean) as string[];

      if (paths.length > 0) {
        console.log("[STORAGE_CLEANUP]: Removing assets", paths);
        await supabase.storage.from(STORAGE_BUCKET).remove(paths);
      }
    }

    // 2. Delete Database Record
    const { error } = await supabase.from("products").delete().eq(id.includes("-") ? "id" : "id", id);
    
    if (!error) {
        if (product) {
            await logAction('delete', 'product', id, `Permanently deleted product: ${product.name}`);
        }
        load();
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("products").update({ is_available: !current }).eq("id", id);
    load();
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "image",
      header: t.admin.image,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/5 border border-white/5">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
              ) : (
                <span className="flex h-full items-center justify-center text-xl">🍗</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground leading-tight">{p.name}</span>
              <span className="text-[10px] text-muted uppercase font-bold tracking-widest">{p.category}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "price",
      header: t.admin.price,
      cell: ({ row }) => (
        <span className="font-black text-white">{formatPrice(Number(row.getValue("price")))}</span>
      )
    },
    {
      accessorKey: "is_available",
      header: t.admin.status,
      cell: ({ row }) => {
        const available = row.getValue("is_available") as boolean;
        const featured = row.original.is_featured;
        const special = row.original.is_special_offer;
        return (
          <div className="flex gap-2">
            <Badge variant={available ? "success" : "warning"} className="uppercase text-[9px] font-black rounded-lg">
              {available ? t.admin.available : t.menu.unavailable}
            </Badge>
            {featured && (
              <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[9px] font-black rounded-lg">
                {t.home.featured}
              </Badge>
            )}
            {special && (
              <Badge className="bg-[#630d16]/20 text-[#ffb347] border-[#630d16]/30 uppercase text-[9px] font-black rounded-lg">
                {t.common.premium}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t.admin.save}</div>,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button size="icon" variant="glass" className="h-8 w-8 rounded-lg" onClick={() => toggleVisibility(p.id, p.is_available)}>
              {p.is_available ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button size="icon" variant="glass" className="h-8 w-8 rounded-lg text-primary" onClick={() => setEditing(p)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="glass" className="h-8 w-8 rounded-lg text-red-400" onClick={() => deleteProduct(p.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      <AdminNav />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">{t.admin.products}</h1>
          <p className="text-muted font-medium">{t.admin.dashboard}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => load()} variant="glass" size="icon" className="h-12 w-12 rounded-2xl">
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setEditing("new")} size="lg" className="h-14 px-8 rounded-2xl bg-primary text-black font-black shadow-lg hover:scale-[1.02] transition-transform">
            <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
            {t.admin.addProduct}
          </Button>
        </div>
      </div>

      {editing !== null && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard strong className="p-8 md:p-10 border-primary/20 shadow-2xl">
            <h2 className="text-2xl font-black mb-8">{editing === "new" ? t.admin.addProduct : `${t.admin.editProduct}: ${editing.name}`}</h2>
            <ProductForm
              product={editing === "new" ? undefined : editing}
              onSuccess={() => {
                setEditing(null);
                load();
              }}
              onCancel={() => setEditing(null)}
            />
          </GlassCard>
        </motion.div>
      )}

      <div className="px-4">
          {loading && products.length === 0 ? (
            <div className="py-20 text-center glass rounded-[3rem]">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted font-black uppercase tracking-widest text-xs">{t.admin.syncing}</p>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={products} 
              searchKey="name" 
              placeholder={t.admin.identify} 
            />
          )}
      </div>
    </div>
  );
}
