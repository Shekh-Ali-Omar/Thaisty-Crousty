import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { RESTAURANT_ID } from "@/lib/constants";
import { resolveProductImageUrl, resolveProductGallery } from "@/lib/image";

/**
 * PRODUCT REPOSITORY
 * Exclusive source of truth: Supabase Database.
 */

export async function getProducts(locale?: string): Promise<Product[]> {
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
    throw new Error("Could not load products.");
  }

  return (data || []).map(row => mapDbToProduct(row, locale));
}

export async function getFeaturedProducts(locale?: string): Promise<Product[]> {
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

  return (data || []).map(row => mapDbToProduct(row, locale));
}

export async function getProductById(id: string, locale?: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data ? mapDbToProduct(data, locale) : null;
}

/** 
 * Helper to ensure consistent types and localized content across Web & Electron.
 */
export function mapDbToProduct(row: any, locale?: string): Product {
  // Locale-based field selection with fallbacks
  // Order: current locale -> English -> fallback base field
  const name = locale === 'ar' ? (row.name_ar || row.name_en || row.name) :
               locale === 'fr' ? (row.name_fr || row.name_en || row.name) :
               (row.name_en || row.name);

  const description = locale === 'ar' ? (row.description_ar || row.description_en || row.description) :
                      locale === 'fr' ? (row.description_fr || row.description_en || row.description) :
                      (row.description_en || row.description);

  // Price logic: Use discount_price if available, otherwise base price
  const activePrice = row.discount_price ? Number(row.discount_price) : Number(row.price);

  const primaryRawImage = row.image_url || row.image || (Array.isArray(row.images) && row.images[0]) || null;
  const resolvedPrimary = resolveProductImageUrl(primaryRawImage);
  const resolvedGallery = resolveProductGallery(row.images, primaryRawImage);

  return {
    ...row,
    name,
    description,
    price: activePrice,
    original_price: row.original_price ? Number(row.original_price) : Number(row.price),
    discount_price: row.discount_price ? Number(row.discount_price) : null,
    image: resolvedPrimary,
    image_url: resolvedPrimary,
    images: resolvedGallery,
    is_featured: !!row.is_featured,
    is_available: !!row.is_available,
    is_special_offer: !!row.is_special_offer
  } as Product;
}

