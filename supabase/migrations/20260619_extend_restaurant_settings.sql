-- Extend restaurant_settings table with closure features
ALTER TABLE public.restaurant_settings
ADD COLUMN IF NOT EXISTS custom_message TEXT NULL,
ADD COLUMN IF NOT EXISTS forced_closed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS reopen_at TIMESTAMPTZ NULL;
