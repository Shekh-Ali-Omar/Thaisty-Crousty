# Thaisty Crousty - Dely Ibrahim

Production-ready single-restaurant food ordering web app.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (database, auth, storage)
- **Zustand** (cart + localStorage)
- **react-hook-form** + **zod**
- **framer-motion** + **lucide-react**

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill Supabase URL, anon key, service role key, WhatsApp number
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor.
3. Run `supabase/seed-products.sql` to load all **22 menu items** (images in `public/products/`).
4. Create a **public** storage bucket named `product-images` and run `supabase/storage.sql` (for admin uploads).
4. Create an admin user: **Authentication → Users → Add user** (email + password).
5. Copy project URL and keys into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RESTAURANT_ID=00000000-0000-0000-0000-000000000001
NEXT_PUBLIC_WHATSAPP_NUMBER=213XXXXXXXXX
```

## Features

| Area | Routes |
|------|--------|
| Home | `/` |
| Menu | `/menu` |
| Cart | `/cart` |
| Checkout (3 steps) | `/checkout` |
| Profile / language | `/profile` |
| Admin | `/admin`, `/admin/products`, `/admin/orders` |
| Admin login | `/admin/login` |

**Order flow:** checkout → save order + items via `/api/orders` → redirect to WhatsApp with prefilled message.

## Brand & UI

- **Liquid Glass** design: glassmorphism, mesh gradients, floating product cards
- Colors: background `#0B0B0B`, glass `rgba(255,255,255,0.06–0.10)`, primary `#FF8C00`, secondary `#FFB347`
- Fonts: Inter (EN/FR), Cairo (AR)
- i18n: English, French, Arabic (browser + profile)
- Menu works offline from `lib/products/catalog.ts` if Supabase is empty

## Menu (22 products)

| Category | Items |
|----------|--------|
| **Crousty** | Classic, Mix, Curry Thai, Curry Mix |
| **Spicy** | Spicy, Curry Spicy |
| **Sweet** | Sweet, Curry Sweet, 9× Crème Dessert, Crème Brûlée, 4× Tiramisu |

Prices are placeholders (750–850 DA bowls, 350–500 DA desserts). Adjust in admin or `data/products.json`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
