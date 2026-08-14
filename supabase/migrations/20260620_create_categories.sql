-- Migration: Create canonical Categories table and backfill from products

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL,
    slug TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT,
    name_ar TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(restaurant_id, slug)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by authenticated users" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Categories are updatable by authenticated users" ON public.categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are deletable by authenticated users" ON public.categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Dynamically backfill categories from existing products (if any are unmapped)
INSERT INTO public.categories (restaurant_id, slug, name_en)
SELECT DISTINCT 
    (CASE WHEN p.restaurant_id IS NOT NULL THEN p.restaurant_id::uuid ELSE '00000000-0000-0000-0000-000000000001'::uuid END), 
    p.category, 
    initcap(p.category)
FROM public.products p
WHERE p.category IS NOT NULL
ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- Insert/Update known defaults with translations and sort orders
INSERT INTO public.categories (restaurant_id, slug, name_en, name_fr, name_ar, sort_order)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'crousty', 'Crousty', 'Crousty', 'كروستي', 1),
    ('00000000-0000-0000-0000-000000000001', 'spicy', 'Spicy', 'Épicé', 'حار', 2),
    ('00000000-0000-0000-0000-000000000001', 'sweet', 'Sweet', 'Sucré', 'حلو', 3),
    ('00000000-0000-0000-0000-000000000001', 'drink', 'Drinks', 'Boissons', 'مشروبات', 4),
    ('00000000-0000-0000-0000-000000000001', 'sides', 'Sides', 'Accompagnements', 'إضافات', 5),
    ('00000000-0000-0000-0000-000000000001', 'dessert', 'Desserts', 'Desserts', 'حلويات', 6)
ON CONFLICT (restaurant_id, slug) DO UPDATE 
SET 
    name_en = EXCLUDED.name_en,
    name_fr = EXCLUDED.name_fr,
    name_ar = EXCLUDED.name_ar,
    sort_order = EXCLUDED.sort_order;
