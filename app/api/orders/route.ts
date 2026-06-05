import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RESTAURANT_ID } from "@/lib/constants";
import { createOrderSchema } from "@/lib/validations/order";
import { buildOrderMessage, getWhatsAppUrl } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, address, notes, items } = parsed.data;
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: RESTAURANT_ID,
        name,
        phone,
        address,
        notes: notes ?? null,
        total,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error(orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      note: item.note ?? null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      return NextResponse.json(
        { error: "Failed to save order items" },
        { status: 500 }
      );
    }

    const message = buildOrderMessage({
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        note: i.note,
      })),
      total,
      name,
      phone,
      address,
      notes,
    });

    const whatsappUrl = getWhatsAppUrl(message);

    return NextResponse.json({
      orderId: order.id,
      whatsappUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
