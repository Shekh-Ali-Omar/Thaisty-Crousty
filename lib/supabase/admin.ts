import { createClient } from "@supabase/supabase-js";

/**
 * ADMIN SERVER CLIENT
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS.
 * STRICTLY for server-side usage.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("[SUPABASE_ADMIN_ERROR]: Missing admin credentials. Check your environment variables.");
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
