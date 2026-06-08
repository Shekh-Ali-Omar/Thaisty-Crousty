-- Phase 3: Realtime & Audit Infrastructure

-- 1. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  action_type text NOT NULL, -- 'create', 'update', 'delete', 'login', 'status_change'
  entity_type text NOT NULL, -- 'product', 'order', 'auth'
  entity_id text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'new_order', 'system'
  title text NOT NULL,
  message text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can insert activity logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can view notifications" ON public.admin_notifications
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 5. Helper function for logging (Optional but cleaner)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action_type text,
  p_entity_type text,
  p_entity_id text,
  p_description text
) RETURNS void AS $$
BEGIN
  INSERT INTO public.activity_logs (admin_id, admin_email, action_type, entity_type, entity_id, description)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
