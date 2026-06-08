import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { RESTAURANT_ID } from "@/lib/constants";

/**
 * PRODUCT REPOSITORY
 * Exclusive source of truth: Supabase Database.
 * 
 * STRICT POLICY:
 * - Production: Supabase ONLY. Throws if data is missing or query fails.
 * - Development: Throws if failed to ensure devs sync their DB.
 */

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("restaurant_id", RESTAURANT_ID)
    .eq("is_available", true)
    .order("category")
    .order("name");

  if (error) {
    console.error("[REPOS_CRITICAL]: Failed to fetch products from Supabase", error);
    throw new Error("Could not load products. Please check connection.");
  }

  if (!data || data.length === 0) {
    console.warn("[REPOS_WARNING]: Database returned 0 products for restaurant", RESTAURANT_ID);
    return [];
  }

  return data.map(mapDbToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("restaurant_id", RESTAURANT_ID)
    .eq("is_available", true)
    .eq("is_featured", true)
    .order("name");

  if (error) {
    console.error("[REPOS_CRITICAL]: Failed to fetch featured products", error);
    throw new Error("Could not load featured items.");
  }

  return (data || []).map(mapDbToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("[REPOS_CRITICAL]: Error fetching product by ID", error);
    throw error;
  }

  return data ? mapDbToProduct(data) : null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts();
  if (category === "all") return all;
  return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

/** 
 * Helper to ensure consistent types.
 * No fallbacks to local files are allowed here.
 */
function mapDbToProduct(row: any): Product {
  return {
    ...row,
    price: Number(row.price),
    description: row.description || "",
    image: row.image || "",
    is_featured: !!row.is_featured,
    is_available: !!row.is_available
  } as Product;
}
