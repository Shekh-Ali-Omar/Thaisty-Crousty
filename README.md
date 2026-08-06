# 🍔 Thaisty Crousty - Production Technical Documentation & Operational Architecture

**Thaisty Crousty** is a high-performance, real-time commercial restaurant ordering system and POS operations dashboard built with Next.js 16, Electron, React 19, Vite, and Supabase.

---

## 🏗 Architecture Overview

The system consists of two tightly integrated operational environments sharing domain models, localization dictionaries, and Supabase BaaS data layers:

1. **Customer Web Storefront & Web Admin (`/app`)**: Powered by Next.js 16 App Router, Tailwind CSS v4, Zustand, and server-side price/schedule validation.
2. **Desktop POS Operations Dashboard (`/desktop-dashboard`)**: Powered by Electron + React 19 + Vite 6. Features silent thermal receipt printing (58mm/80mm), offline print queueing, auto-retry execution, and real-time audio alert notifications.

### Core Data Flow

```mermaid
graph TD
    subgraph Web Storefront [Next.js 16 App Router]
        Customer[Customer Client] -->|POST Payload| OrdersAPI[/api/orders]
        OrdersAPI -->|Verify Hours| StatusEngine[lib/restaurant-status.ts]
        OrdersAPI -->|Recalculate Prices| DBProducts[(Supabase Products)]
        OrdersAPI -->|Insert Header & Snapshots| DB[(Supabase Postgres)]
    end

    subgraph Desktop Dashboard [Electron + Vite + React 19]
        DB -->|Realtime WebSockets| DesktopApp[App.tsx Dashboard]
        DesktopApp -->|Deduplicate Event| AudioAlert[Order Ping Alert]
        DesktopApp -->|Pass 58mm/80mm| PrintQueue[useAutoPrint Queue]
        PrintQueue -->|IPC Silent Print| MainProc[Electron Main Process main.js]
        MainProc -->|Thermal Output| HardwarePrint[POS Thermal Printer]
    end
```

---

## 🛠 Tech Stack

| Component | Technology | Purpose & Usage |
| :--- | :--- | :--- |
| **Storefront & Web** | Next.js 16 (App Router) | Server-side rendering, customer flow, security middleware, API endpoints. |
| **Desktop Application** | Electron 33 + Vite 6 + React 19 | POS desktop dashboard, hardware thermal printing IPC, auto-print queue. |
| **Database & BaaS** | Supabase (Postgres, Storage, Auth) | Database storage, real-time WebSockets, RLS access policies. |
| **Styling & Motion** | Tailwind CSS v4 + Framer Motion 12 | Liquid Glass UI design, smooth micro-interactions, responsive layouts. |
| **State Management** | Zustand 5 | Persistent customer cart state and POS printer preferences. |
| **Validations & i18n** | Zod 4 + Custom i18n Engine | Schema validation, multilingual dictionaries (AR, FR, EN) with RTL support. |

---

## 📁 Repository Directory Structure

```text
d:\oaa\thaisty-order\
├── app/                        # Next.js 16 App Router
│   ├── (customer)/             # Customer pages (Home, Menu, Product, Cart, Checkout, Success)
│   ├── admin/                  # Web admin dashboard (Orders, Products, Activity, Analytics)
│   └── api/                    # Secure Server API routes (/api/orders, /api/restaurant-status)
├── components/                 # Shared React Components
│   ├── admin/                  # Shared Admin UI (ReceiptTemplate, OrderDetailsModal)
│   ├── glass/                  # Glassmorphism container components
│   └── ui/                     # Primitives (Button, Input, Badge, Card)
├── desktop-dashboard/          # Electron POS Desktop Dashboard
│   ├── electron/               # Main process (main.js) and context bridge (preload.js)
│   ├── src/                    # Desktop React app (App.tsx, ProductManager, RestaurantStatus)
│   └── vite.config.ts          # Vite bundler with Next.js compatibility aliases
├── lib/                        # Domain Core & Utility Layer
│   ├── image.ts                # Unified Product Image Resolver
│   ├── restaurant-status.ts    # Africa/Algiers timezone schedule & reopening calculator
│   ├── types.ts                # TypeScript domain models (Product, Order, RestaurantSettings)
│   └── products/repository.ts  # Database repository abstraction
├── messages/                   # i18n JSON Dictionaries (en.json, fr.json, ar.json)
├── store/                      # Zustand Stores (cartStore.ts)
└── supabase/                   # SQL Migrations, Schema, and Seed files
```

---

## 🔒 Security & Role-Based Access Control (RBAC)

* **Server-side Validation**: Prices and subtotals are recalculated on the server in `/api/orders` from database prices to prevent client-side tampering.
* **Operating Hours Enforcement**: Customer checkout and cart additions are validated against `restaurant_settings` in `Africa/Algiers` timezone.
* **Middleware RBAC**: `middleware.ts` intercepts `/admin` routes and verifies `is_admin` role via service role client to prevent unauthorized access.

---

## 🖨 Thermal Printing & Offline Queue Engine

* **Silent Printing**: Invokes hidden native `BrowserWindow.print({ silent: true })` from Electron main process.
* **Paper Roll Adaptation**: Adapts receipt layout, fonts, and padding dynamically for **80mm** or **58mm** paper widths via `ReceiptTemplate.tsx`.
* **Queue & Retry**: Failed print jobs stay queued and auto-retry every 20 seconds when hardware is restored.

---

## 🚀 Setup & Execution Guide

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Package Manager**: `npm`

### Environment Configuration (`.env.local` & `desktop-dashboard/.env`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RESTAURANT_ID=00000000-0000-0000-0000-000000000001
```

### Running Locally

1. **Web Storefront & Web Admin**:
   ```bash
   npm run dev
   ```
   * Web Customer: [http://localhost:3000](http://localhost:3000)
   * Web Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

2. **Electron POS Desktop Dashboard**:
   ```bash
   cd desktop-dashboard
   npm run dev           # Terminal 1 (Vite dev server)
   npm run electron:dev  # Terminal 2 (Electron window)
   ```

---

## 📋 Production Readiness Verification

- ✅ **TypeScript Check**: `0` errors across Web & Desktop.
- ✅ **Image Resolver**: Single source of truth in `lib/image.ts`.
- ✅ **Realtime Resiliency**: Deduplicated event payloads with automatic WebSocket auto-reconnect.
- ✅ **Memory Audit**: Explicit destruction of print `BrowserWindow` handles to prevent memory leaks.
