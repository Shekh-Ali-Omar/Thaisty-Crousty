-- Migration to professional Order Management System

-- 1. Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- 2. Update orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid' 
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
DROP CONSTRAINT IF EXISTS orders_status_check,
ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));

-- 3. Function to generate order number (TC-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'TC-' || nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to apply order number on insert
DROP TRIGGER IF EXISTS tr_generate_order_number ON public.orders;
CREATE TRIGGER tr_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- 5. Update order_items table for snapshots
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS subtotal numeric(10, 2) GENERATED ALWAYS AS (quantity * price) STORED;

-- 6. Update existing order items product_name (if any)
-- This assumes we might have data already, otherwise it's just safety
UPDATE public.order_items oi
SET product_name = p.name
FROM public.products p
WHERE oi.product_id = p.id AND oi.product_name IS NULL;

-- 7. Ensure authenticated users (admins) can update status
DROP POLICY IF EXISTS "orders_update_authenticated" ON public.orders;
CREATE POLICY "orders_update_authenticated" ON public.orders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
