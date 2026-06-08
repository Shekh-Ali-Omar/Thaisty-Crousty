"use client";

import type { Product } from "@/lib/types";
import { getProducts, getProductById } from "./repository";

/**
 * FETCH PRODUCTS
 * Entry point for frontend pages.
 * Strictly loads from Supabase Repository.
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    return await getProducts();
  } catch (err) {
    console.error("[FETCH_PRODUCTS_ERROR]: Supabase request failed.", err);
    // Return empty to allow UI to show 'No products' or error state
    // instead of crashing or showing stale local data.
    return [];
  }
}

/** Admin fetching */
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  return fetchProducts();
}

/** Get single product by ID */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    return await getProductById(id);
  } catch {
    return null;
  }
}
