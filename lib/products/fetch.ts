"use client";

import type { Product } from "@/lib/types";
import { RESTAURANT_ID } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { catalogToProducts } from "@/lib/products/catalog";

export async function fetchProducts(): Promise<Product[]> {
  const catalog = catalogToProducts();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .eq("is_available", true)
      .order("category")
      .order("name");

    if (error || !data?.length) {
      return catalog;
    }

    return data.map((row) => {
      const fromCatalog = catalog.find((c) => c.id === row.id || c.name === row.name);
      return {
        ...row,
        price: Number(row.price),
        image: row.image || fromCatalog?.image || null,
        description: row.description ?? fromCatalog?.description,
      } as Product;
    });
  } catch {
    return catalog;
  }
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const catalog = catalogToProducts();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .order("name");

    if (error || !data?.length) return catalog;
    return data as Product[];
  } catch {
    return catalog;
  }
}
