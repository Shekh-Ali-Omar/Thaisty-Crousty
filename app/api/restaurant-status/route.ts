import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_ID } from "@/lib/constants";
import { isRestaurantOpen } from "@/lib/restaurant-status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = null;
    let fetchErr = null;

    // Try admin client first if service role key exists, otherwise fallback to anon client
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from("restaurant_settings")
        .select("*")
        .eq("restaurant_id", RESTAURANT_ID)
        .single();
      settings = data;
      fetchErr = error;
    } catch (adminErr) {
      console.warn("[API_STATUS_WARN]: Admin client failed, attempting fallback to public client.");
      const clientSupabase = createClient();
      const { data, error } = await clientSupabase
        .from("restaurant_settings")
        .select("*")
        .eq("restaurant_id", RESTAURANT_ID)
        .single();
      settings = data;
      fetchErr = error;
    }

    if (fetchErr || !settings) {
      console.error("[API_STATUS_ERROR]: Failed to fetch settings from Supabase", fetchErr);
      return NextResponse.json(
        { isOpen: true, message: "Restaurant status temporarily unavailable" },
        { status: 200 }
      );
    }

    const result = isRestaurantOpen(settings);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[API_STATUS_CRASH]:", e);
    return NextResponse.json(
      { isOpen: true, message: "Restaurant status check error" },
      { status: 200 }
    );
  }
}
