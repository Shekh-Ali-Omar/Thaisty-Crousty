import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Supabase credentials missing in desktop-dashboard/.env");
}

export const supabase = createSupabaseClient(url || '', key || '');

import { resolveProductImageUrl } from '@/lib/image';

// Helper to get public URL for images using unified resolver
export const getPublicImageUrl = (path: string | null) => {
  return resolveProductImageUrl(path);
};

// Compatibility with Next.js createClient pattern
export const createClient = () => supabase;
