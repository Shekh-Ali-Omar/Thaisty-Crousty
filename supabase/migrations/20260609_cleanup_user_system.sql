-- Revert User Accounts & Profiles System changes
-- 1. Revert handle_new_user trigger to original simple version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. (Optional but safer to leave columns if they contain data, but here we're cleaning up)
-- We'll just remove the policy that was added for user order viewing
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 3. We'll leave the user_id column in orders for now to avoid breaking existing order history 
-- if any was created, but the code will no longer populate it.
