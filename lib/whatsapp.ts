import { BRAND_FULL, WHATSAPP_NUMBER } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Dictionary } from "./i18n/dictionaries";

export type WhatsAppLineItem = {
  name: string;
  quantity: number;
  price: number;
  note?: string;
};

export type WhatsAppOrderDetails = {
  items: WhatsAppLineItem[];
  total: number;
  name: string;
  phone: string;
  address: string;
  notes?: string;
};

export function buildOrderMessage(details: WhatsAppOrderDetails, t: Dictionary): string {
  const lines = details.items.map((item) => {
    const lineTotal = item.price * item.quantity;
    const noteSuffix = item.note ? ` (${item.note})` : "";
    return `- ${item.name} × ${item.quantity} = ${formatPrice(lineTotal)}${noteSuffix}`;
  });

  return [
    `${t.whatsapp.newOrder} - ${BRAND_FULL}`,
    "",
    `${t.whatsapp.items}:`,
    ...lines,
    "",
    `${t.whatsapp.total}: ${formatPrice(details.total)}`,
    "",
    `${t.whatsapp.name}: ${details.name}`,
    `${t.whatsapp.phone}: ${details.phone}`,
    `${t.whatsapp.address}: ${details.address}`,
    `${t.whatsapp.notes}: ${details.notes?.trim() || "-"}`,
  ].join("\n");
}

export async function submitOrder({
  customer,
  items,
  total,
  t,
}: {
  customer: WhatsAppOrderDetails;
  items: WhatsAppLineItem[];
  total: number;
  t: Dictionary;
}) {
  const message = buildOrderMessage(
    {
      ...customer,
      items,
      total,
    },
    t
  );

  const url = getWhatsAppUrl(message);
  window.open(url, "_blank");
  return true;
}

export function getWhatsAppUrl(message: string, phone = WHATSAPP_NUMBER): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encoded}`;
}

