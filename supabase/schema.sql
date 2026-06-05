-- Thaisty Crousty - Dely Ibrahim
-- Run in Supabase SQL Editor, then create Storage bucket "product-images" (public read)

-- Extensions
create extension if not exists "uuid-ossp";

-- Restaurants (multi-tenant ready)
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_phone text,
  created_at timestamptz not null default now()
);

-- Seed default restaurant (update whatsapp_phone after deploy)
insert into public.restaurants (id, name, whatsapp_phone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Thaisty Crousty - Dely Ibrahim',
  '213555123456'
)
on conflict (id) do nothing;

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  image text,
  category text not null default 'other',
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_restaurant_id_idx on public.products (restaurant_id);
create index if not exists products_category_idx on public.products (category);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text not null,
  address text not null,
  notes text,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'delivered')),
  created_at timestamptz not null default now()
);

create index if not exists orders_restaurant_id_idx on public.orders (restaurant_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  note text
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- RLS
alter table public.restaurants enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Restaurants: public read
create policy "restaurants_select" on public.restaurants
  for select using (true);

-- Products: public read available; admins read all
create policy "products_select_public" on public.products
  for select using (is_available = true);

create policy "products_select_authenticated" on public.products
  for select to authenticated using (true);

create policy "products_insert_authenticated" on public.products
  for insert to authenticated with check (true);

create policy "products_update_authenticated" on public.products
  for update to authenticated using (true);

create policy "products_delete_authenticated" on public.products
  for delete to authenticated using (true);

-- Orders: anyone can insert; authenticated can read/update
create policy "orders_insert_anon" on public.orders
  for insert with check (true);

create policy "orders_select_authenticated" on public.orders
  for select to authenticated using (true);

create policy "orders_update_authenticated" on public.orders
  for update to authenticated using (true);

-- Order items: insert with order; authenticated read
create policy "order_items_insert_anon" on public.order_items
  for insert with check (true);

create policy "order_items_select_authenticated" on public.order_items
  for select to authenticated using (true);

create policy "order_items_select_via_order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
    )
  );

-- Sample products (optional — remove in production if you add via admin)
insert into public.products (restaurant_id, name, price, category, image, is_available)
values
  ('00000000-0000-0000-0000-000000000001', 'Crousty Chicken', 450.00, 'chicken', null, true),
  ('00000000-0000-0000-0000-000000000001', 'Thaisty Burger', 380.00, 'burgers', null, true),
  ('00000000-0000-0000-0000-000000000001', 'Fries Box', 150.00, 'sides', null, true),
  ('00000000-0000-0000-0000-000000000001', 'Coca Cola', 80.00, 'drinks', null, true)
on conflict do nothing;

-- Storage policies (run after creating bucket "product-images" as public):
-- create policy "Public read" on storage.objects for select using (bucket_id = 'product-images');
-- create policy "Auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
-- create policy "Auth update" on storage.objects for update to authenticated using (bucket_id = 'product-images');
-- create policy "Auth delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images');
