-- Migration to professional production-grade products table
-- Adds missing metadata to remove dependency on local catalog.ts

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Index for featured products performance
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products (is_featured) WHERE is_featured = true;
