export type OrderStatus = "pending" | "confirmed" | "preparing" | "delivered";

export type Product = {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  description?: string | null;
  is_available: boolean;
  created_at?: string;
};

export type Order = {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  address: string;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  note: string | null;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & { products?: Product | null })[];
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
