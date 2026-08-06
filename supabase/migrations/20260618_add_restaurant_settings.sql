-- Add restaurant_settings table
create table if not exists public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  is_open boolean not null default true,
  opening_time time not null,
  closing_time time not null,
  manual_override boolean not null default false,
  timezone text not null default 'Africa/Algiers',
  updated_at timestamptz not null default now()
);

-- Ensure only one settings entry per restaurant
create unique index if not exists restaurant_settings_restaurant_id_unique on public.restaurant_settings (restaurant_id);

-- Set up Row Level Security (RLS)
alter table public.restaurant_settings enable row level security;

-- RLS Policies
-- Allow authenticated users to select, insert, update, delete their own restaurant settings
create policy "allow_read_restaurant_settings_by_restaurant_id"
  on public.restaurant_settings for select
  using (true); -- Public read for status check

create policy "allow_crud_restaurant_settings_for_authenticated_users"
  on public.restaurant_settings for all
  using (auth.uid() is not null); -- Temporarily allow all for authenticated, will refine later if needed

-- Seed initial data for the default restaurant
insert into public.restaurant_settings (restaurant_id, is_open, opening_time, closing_time, manual_override, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  true, -- Initially open
  '10:00:00',
  '02:00:00', -- Open until 2 AM
  false,
  'Africa/Algiers'
)
on conflict (restaurant_id) do update set updated_at = now();