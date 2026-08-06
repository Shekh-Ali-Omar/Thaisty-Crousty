# Thai Sty Crousty - POS Desktop Admin Dashboard

This is the commercial desktop POS (Point of Sale) administration application for Thai Sty Crousty, built with Electron 33, React 19, Vite 6, and Supabase.

---

## 🚀 Key Operational Features

* **Real-time Order Stream & Audio Alerts**: Instant WebSockets channel receiving incoming orders with an audio chime (`order-ping.mp3` with Web Audio API synthesizer fallback).
* **Silent ESC/POS Thermal Printing**: Background receipt printing without popups or print dialogs via native Electron IPC.
* **Paper Roll Width Adapter**: Supports both **80mm** standard POS thermal paper and **58mm** compact thermal rolls.
* **Offline Print Queue & Auto-Retry**: Queues failed jobs when hardware or drivers are offline, with auto-retry execution every 20 seconds.
* **Restaurant Schedule Control**: Manager quick action bar allowing **Force Open**, **Force Closed**, and **Resume Schedule** overrides in `Africa/Algiers` timezone.
* **Multilingual UI**: Native support for Arabic (RTL), French, and English.

---

## 🛠 Tech Stack

* **Desktop Runtime**: Electron `v33.2.1`
* **UI Framework**: React `v19.0.0` + Vite `v6.0.3`
* **Styling**: Tailwind CSS `v4.0.0` + Liquid Glass theme
* **BaaS Engine**: Supabase Client (`@supabase/supabase-js`)
* **State Management**: Zustand `v5.0.0` with `persist` middleware

---

## 📂 Project Architecture

```text
desktop-dashboard/
├── electron/
│   ├── main.js        # Main process & silent BrowserWindow IPC printing handler
│   └── preload.js     # Context bridge exposing electron API to renderer
├── src/
│   ├── components/    # POS UI components (OrderRow, OrderModal, ProductManager, RestaurantStatus)
│   ├── hooks/         # Operational hooks (useAutoPrint queue manager)
│   ├── lib/           # Supabase client and Next.js compatibility compatibility layer (next-compat.tsx)
│   ├── store/         # Settings store (selectedPrinter, printerType, paperWidth)
│   ├── App.tsx        # Main application layout and realtime WebSocket channel listener
│   └── main.tsx       # React entry point
└── vite.config.ts     # Vite build config with path aliases to root shared libraries (@/*)
```

---

## ⚙ Setup & Execution

### 1. Installation
```bash
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` file in the `desktop-dashboard` directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESTAURANT_ID=00000000-0000-0000-0000-000000000001
```

### 3. Development Mode
Run Vite dev server and Electron container simultaneously:
```bash
npm run dev           # Terminal 1
npm run electron:dev  # Terminal 2
```

### 4. Production Packaging (.exe)
Package into a standalone Windows executable (`.exe`):
```bash
npm run build
```
Output artifacts are saved under `desktop-dashboard/dist/`.

---

## 🖨 Thermal Printer Configuration

In the **Printer Settings** tab:
1. **Connection Type**: Select `Windows`, `USB`, or `PDF`.
2. **Paper Roll Width**: Select `80mm` or `58mm`.
3. **Active Hardware**: Choose your connected thermal POS printer from the system dropdown.
4. **Test Print**: Click "Trigger Test Print" to verify formatting and paper scaling.
