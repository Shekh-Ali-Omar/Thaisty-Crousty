-- Migration: Professional Product System Enhancements
-- 1. Multiple Images Support
-- 2. Multilingual Content
-- 3. Special Offer System
-- 4. Discount Pricing System

ALTER TABLE public.products
-- Multilingual Names
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS name_fr text,
ADD COLUMN IF NOT EXISTS name_ar text,
-- Multilingual Descriptions
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS description_fr text,
ADD COLUMN IF NOT EXISTS description_ar text,
-- Multiple Images (array of public URLs)
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
-- Marketing & Promotions
ADD COLUMN IF NOT EXISTS is_special_offer boolean DEFAULT false,
-- Discount Pricing
ADD COLUMN IF NOT EXISTS original_price numeric(10, 2) CHECK (original_price >= 0),
ADD COLUMN IF NOT EXISTS discount_price numeric(10, 2) CHECK (discount_price >= 0);

-- Migrate existing data for backward compatibility
UPDATE public.products
SET 
  name_en = name,
  description_en = description,
  images = ARRAY[image]
WHERE name_en IS NULL;

-- Index for special offers
CREATE INDEX IF NOT EXISTS products_special_offer_idx ON public.products (is_special_offer) WHERE is_special_offer = true;
