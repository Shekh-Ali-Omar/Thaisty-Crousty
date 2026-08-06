-- Migration: Add printing status to orders
-- Created: 2026-06-10

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS print_status text NOT NULL DEFAULT 'pending' 
CHECK (print_status IN ('pending', 'printed', 'failed')),
ADD COLUMN IF NOT EXISTS printed_at timestamptz;

-- Ensure indexes for the new status
CREATE INDEX IF NOT EXISTS orders_print_status_idx ON public.orders (print_status);
