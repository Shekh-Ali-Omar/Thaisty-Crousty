-- Thaisty Crousty - Dely Ibrahim
-- Run in Supabase SQL Editor, then create Storage bucket "product-images" (public read)

-- Extensions
create extension if not exists "uuid-ossp";

-- Sequences
create sequence if not exists order_number_seq start 1000;

-- Restaurants (multi-tenant ready)
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_phone text,
  created_at timestamptz not null default now()
);

-- Seed default restaurant
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
  order_number text unique,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text not null,
  address text not null,
  notes text,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists orders_restaurant_id_idx on public.orders (restaurant_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_phone_idx on public.orders (phone);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text, -- snapshot
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  subtotal numeric(10, 2) generated always as (quantity * price) stored,
  note text
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- Functions & Triggers
create or replace function generate_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'TC-' || nextval('order_number_seq');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_generate_order_number
before insert on public.orders
for each row
execute function generate_order_number();

-- RLS
alter table public.restaurants enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies
create policy "restaurants_select" on public.restaurants for select using (true);

create policy "products_select_public" on public.products for select using (is_available = true);
create policy "products_select_authenticated" on public.products for select to authenticated using (true);
create policy "products_insert_authenticated" on public.products for insert to authenticated with check (true);
create policy "products_update_authenticated" on public.products for update to authenticated using (true);
create policy "products_delete_authenticated" on public.products for delete to authenticated using (true);

create policy "orders_insert_anon" on public.orders for insert with check (true);
create policy "orders_select_authenticated" on public.orders for select to authenticated using (true);
create policy "orders_update_authenticated" on public.orders for update to authenticated using (true);
-- Allow users to track their own order if they know ID/number (simplified tracking policy)
create policy "orders_select_public" on public.orders for select using (true); 

create policy "order_items_insert_anon" on public.order_items for insert with check (true);
create policy "order_items_select_authenticated" on public.order_items for select to authenticated using (true);
create policy "order_items_select_public" on public.order_items for select using (true);
