/**
 * THAISTY CROUSTY - UNIFIED IMAGE RESOLVER
 * Single source of truth for product image URLs across Web and Electron.
 */

const DEFAULT_FALLBACK_IMAGE = "/products/crousty-classic.png";

/**
 * Normalizes any product image input string to a clean, valid URL or public path.
 * 
 * Supports:
 * 1. Full Supabase / HTTP URLs -> returns directly
 * 2. Nested duplicate paths (e.g., 'products/products/crousty.png') -> normalizes to '/products/crousty.png'
 * 3. Local relative paths (e.g., 'crousty.png' or '/products/crousty.png') -> normalizes to clean '/products/...' path
 * 4. Missing/Null/Empty -> returns default fallback placeholder
 */
export function resolveProductImageUrl(imageInput: string | null | undefined): string {
  if (!imageInput || typeof imageInput !== "string") {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const trimmed = imageInput.trim();
  if (!trimmed) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // Case 1: Full HTTP/HTTPS URL (e.g. Supabase Storage Public URL)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/products\/products\//g, "/products/");
  }

  // Case 2: Clean leading slashes and duplicate 'products' subpaths
  let cleanPath = trimmed.replace(/\\/g, "/"); // normalize backslashes
  cleanPath = cleanPath.replace(/^\/+/, "");   // remove leading slashes

  // Fix duplicated 'products/products/...' or 'products/...' prefixes
  while (cleanPath.startsWith("products/")) {
    cleanPath = cleanPath.substring(9); // strip leading 'products/'
  }

  // If path was just 'products' or became empty
  if (!cleanPath) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // Return clean web relative path
  return `/products/${cleanPath}`;
}

/**
 * Resolves an array of gallery image URLs using the main image and gallery list.
 */
export function resolveProductGallery(
  images: string[] | null | undefined,
  mainImage: string | null | undefined
): string[] {
  const result: string[] = [];

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img) => {
      if (img) {
        const resolved = resolveProductImageUrl(img);
        if (!result.includes(resolved)) {
          result.push(resolved);
        }
      }
    });
  }

  if (mainImage) {
    const resolvedMain = resolveProductImageUrl(mainImage);
    if (!result.includes(resolvedMain)) {
      result.unshift(resolvedMain); // ensure main image is at the front
    }
  }

  if (result.length === 0) {
    result.push(DEFAULT_FALLBACK_IMAGE);
  }

  return result;
}
