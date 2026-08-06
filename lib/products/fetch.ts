"use client";

import type { Product } from "@/lib/types";
import { getProducts, getProductById } from "./repository";

/**
 * FETCH PRODUCTS
 * Entry point for frontend pages.
 */
export async function fetchProducts(locale?: string): Promise<Product[]> {
  try {
    return await getProducts(locale);
  } catch (err) {
    console.error("[FETCH_PRODUCTS_ERROR]: Supabase request failed.", err);
    return [];
  }
}

/** Get single product by ID */
export async function fetchProductById(id: string, locale?: string): Promise<Product | null> {
  try {
    return await getProductById(id, locale);
  } catch {
    return null;
  }
}

/** Admin fetching */
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  // Pass no locale for admin to get raw or default names
  return fetchProducts();
}
