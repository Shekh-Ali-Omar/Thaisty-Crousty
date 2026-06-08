export const BRAND_NAME = "Thaisty Crousty";
export const BRAND_SUBTITLE = "Dely Ibrahim";
export const BRAND_FULL = `${BRAND_NAME} - ${BRAND_SUBTITLE}`;

export const RESTAURANT_ID =
  process.env.NEXT_PUBLIC_RESTAURANT_ID ??
  "00000000-0000-0000-0000-000000000001";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "213555123456";

export const CATEGORIES = [
  "all",
  "crousty",
  "spicy",
  "sweet",
  "drink",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  crousty: "Crousty",
  spicy: "Spicy",
  sweet: "Sweet",
  drink: "Drinks",
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
] as const;

export const STORAGE_BUCKET = "products";
