-- Seed products for Thaisty Crousty
-- This file preserves exact UUIDs and includes full metadata (description, is_featured)
-- Background: Products table is now the ONLY source of truth.

-- Clear existing products for the default restaurant
DELETE FROM public.products WHERE restaurant_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO public.products (
  id, 
  restaurant_id, 
  name, 
  price, 
  category, 
  image, 
  description, 
  is_available,
  is_featured
)
VALUES
  -- CROUSTY
  ('a1000001-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000001', 'Crousty Classic', 750, 'crousty', '/products/crousty-classic.png', 'Riz blanc, poulet crousty, sauce blanche, oignons frits, persil.', true, true),
  ('a1000001-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'Crousty Spicy', 750, 'spicy', '/products/crousty-spicy.png', 'Riz blanc, poulet crousty, sauce blanche, sauce piquante, oignons frits, persil.', true, false),
  ('a1000001-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000001', 'Crousty Sweet', 750, 'sweet', '/products/crousty-sweet.png', 'Riz blanc, poulet crousty, sauce blanche, sauce sucrée, oignons frits, persil.', true, false),
  ('a1000001-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000001', 'Crousty Mix', 800, 'crousty', '/products/crousty-mix.png', 'Riz blanc, poulet crousty, sauce blanche, sauce sucrée, sauce piquante, oignons frits, persil.', true, false),
  ('a1000001-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000001', 'Crousty Curry Thai', 800, 'crousty', '/products/crousty-curry-thai.png', 'Riz blanc, poulet crousty, sauce curry, oignons frits, persil.', true, false),
  ('a1000001-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Crousty Curry Spicy', 800, 'spicy', '/products/crousty-curry-spicy.png', 'Riz blanc, poulet crousty, sauce curry, sauce piquante, oignons frits, persil.', true, true),
  ('a1000001-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', 'Crousty Curry Sweet', 800, 'sweet', '/products/crousty-curry-sweet.png', 'Riz blanc, poulet crousty, sauce curry, sauce sucrée, oignons frits, persil.', true, false),
  ('a1000001-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000001', 'Crousty Curry Mix', 850, 'crousty', '/products/crousty-curry-mix.png', 'Riz blanc, poulet crousty, sauce curry, sauce piquante, sauce sucrée, oignons frits, persil.', true, false),
  
  -- DESSERTS
  ('a1000002-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Bueno', 400, 'sweet', '/products/creme-dessert-bueno.png', 'Crème dessert onctueuse saveur Bueno, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Nutella', 450, 'sweet', '/products/creme-dessert-nutella.png', 'Crème dessert chocolat-noisette, pot 170g.', true, true),
  ('a1000002-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Ferrero', 450, 'sweet', '/products/creme-dessert-ferrero.png', 'Crème dessert chocolat premium, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Pistache', 450, 'sweet', '/products/creme-dessert-pistache.png', 'Crème dessert pistache, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Caramel Speculoos', 400, 'sweet', '/products/creme-dessert-caramel-speculoos.png', 'Crème dessert caramel et speculoos, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Raffaello', 400, 'sweet', '/products/creme-dessert-raffaello.png', 'Crème dessert coco-amande, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Bounty', 400, 'sweet', '/products/creme-dessert-bounty.png', 'Crème dessert coco, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Vanille Framboise', 400, 'sweet', '/products/creme-dessert-vanille-framboise.png', 'Crème dessert vanille et framboise, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000001', 'Crème Dessert Framboise Pistache', 450, 'sweet', '/products/creme-dessert-framboise-pistache.png', 'Crème dessert framboise et pistache, pot 170g.', true, false),
  ('a1000002-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000001', 'Crème Brûlée', 350, 'sweet', '/products/creme-brulee.png', 'Crème brûlée vanille caramélisée, pot 120g.', true, false),
  
  -- TIRAMISUS
  ('a1000003-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Tiramisu Pistache', 500, 'sweet', '/products/tiramisu-pistache.png', 'Tiramisu pistache en couches, portion individuelle.', true, true),
  ('a1000003-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'Tiramisu Caramel', 500, 'sweet', '/products/tiramisu-caramel.png', 'Tiramisu caramel beurre salé, portion individuelle.', true, false),
  ('a1000003-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', 'Tiramisu Bueno', 500, 'sweet', '/products/tiramisu-bueno.png', 'Tiramisu saveur Bueno, portion individuelle.', true, false),
  ('a1000003-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000001', 'Tiramisu Chocolat', 500, 'sweet', '/products/tiramisu-chocolat.png', 'Tiramisu chocolat intense, portion individuelle.', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  is_available = EXCLUDED.is_available,
  is_featured = EXCLUDED.is_featured;
