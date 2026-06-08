export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type Product = {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  description?: string | null;
  is_available: boolean;
  is_featured?: boolean;
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
