"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";
import { RESTAURANT_ID } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | "new">(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .order("name");
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  return (
    <>
      <AdminNav />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {editing !== null && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <ProductForm
              product={editing === "new" ? undefined : editing}
              onSuccess={() => {
                setEditing(null);
                load();
              }}
              onCancel={() => setEditing(null)}
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex gap-3 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-2xl">🍗</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-sm text-primary">{formatPrice(Number(p.price))}</p>
                  <div className="mt-1 flex gap-1">
                    <Badge variant="secondary">{p.category}</Badge>
                    {!p.is_available && (
                      <Badge variant="warning">Hidden</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProduct(p.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
