import { createClient } from "@/lib/supabase/client";

export type AdminAction = 'create' | 'update' | 'delete' | 'login' | 'status_change' | 'print';
export type AdminEntityType = 'order' | 'product' | 'category' | 'auth' | 'system' | 'settings';

/**
 * LOG ADMIN ACTION
 * Records administrative actions in the activity_logs table for auditing.
 */
export async function logAction(
  action_type: AdminAction,
  entity_type: AdminEntityType,
  entity_id: string,
  description: string
) {
  try {
    const supabase = createClient();
    
    // Get current user for email snapshot
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("activity_logs").insert({
      admin_id: user?.id,
      admin_email: user?.email,
      action_type,
      entity_type,
      entity_id,
      description
    });

    if (error) {
      console.error("[AUDIT_LOG_ERROR]:", JSON.stringify(error, null, 2));
    }
  } catch (err) {
    console.error("[AUDIT_LOG_CRASH]:", JSON.stringify(err, null, 2));
  }
}
