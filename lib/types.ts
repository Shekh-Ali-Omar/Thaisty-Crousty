export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type CategoryItem = {
  id: string;
  restaurant_id: string;
  slug: string;
  name_en: string;
  name_fr: string | null;
  name_ar: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  restaurant_id: string;
  name: string; // Dynamic based on locale
  price: number; // Dynamic: discount_price ?? price
  image: string | null; // Primary image (can be full URL or relative)
  image_url?: string | null; // Always full public URL for desktop/display
  images?: string[]; // Full gallery
  category: string;
  description?: string | null; // Dynamic based on locale
  is_available: boolean;
  is_featured?: boolean;
  is_special_offer?: boolean;
  original_price?: number | null;
  discount_price?: number | null;
  
  // Multilingual raw fields from DB
  name_en?: string | null;
  name_fr?: string | null;
  name_ar?: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  
  created_at?: string;
};

export type Order = {
  id: string;
  order_number: string;
  restaurant_id: string;
  name: string;
  phone: string;
  address: string;
  notes: string | null;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  print_status: "pending" | "printing" | "queued" | "printed" | "failed";
  printed_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string | null; // Snapshot
  quantity: number;
  price: number;
  subtotal: number;
  note: string | null;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type CreateOrderPayload = {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    note?: string;
  }[];
};

export type RestaurantSettings = {
  id: string;
  restaurant_id: string;
  is_open: boolean;
  opening_time: string; // "HH:mm:ss"
  closing_time: string; // "HH:mm:ss"
  manual_override: boolean;
  timezone: string;
  updated_at: string;
  custom_message: string | null;
  forced_closed: boolean;
  reopen_at: string | null;
  paper_width?: "58mm" | "80mm";
};
