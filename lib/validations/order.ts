import { Dictionary } from "@/lib/i18n/dictionaries";
import { z } from "zod";

export const getCheckoutSchema = (t: Dictionary) => z.object({
  name: z.string().min(2, t.checkout.errors.name),
  phone: z.string().min(8, t.checkout.errors.phone),
  address: z.string().min(5, t.checkout.errors.address),
  notes: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  note: z.string().optional(),
});

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  notes?: string;
};
