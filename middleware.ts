import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * THAISTY CROUSTY - SECURITY MIDDLEWARE
 * Enforces Role-Based Access Control (RBAC)
 * 1. Authenticated check (via Cookie client)
 * 2. Admin role check (via Admin client to bypass RLS/Session issues)
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return supabaseResponse;

  // Cookie-based client for session management
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Verify Auth Session
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLogin = request.nextUrl.pathname === "/admin/login";

  // Case 1: Trying to access Admin pages
  if (isAdminRoute && !isLogin) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // AUTHENTICATED -> Check Role via Admin Client
    // We use the admin client here because it's the most reliable way 
    // to perform a DB query in middleware without hitting RLS recursion 
    // or session propagation delays.
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.warn(`[SECURITY_ALERT]: Access denied to ${request.nextUrl.pathname} for user ${user.email}. Role Check Failed.`);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Case 2: Logged in admin visiting Login page -> redirect to Dashboard
  if (isLogin && user) {
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
      
    if (profile?.is_admin) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return NextResponse.redirect(adminUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
