import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RESTAURANT_ID } from "@/lib/constants";
import { createOrderSchema } from "@/lib/validations/order";
import { isRestaurantOpen } from "@/lib/restaurant-status";

/**
 * PRODUCTION-GRADE ORDER API
 * Hardened to prevent price manipulation and verify product state.
 * Updated to support discount pricing.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[API_CRITICAL]: Missing Supabase credentials in server environment.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, address, notes, items } = parsed.data;
    const supabase = createAdminClient();

    // Verify restaurant opening hours (with safety fallback)
    const { data: settings, error: settingsError } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .single();

    if (!settingsError && settings) {
      const statusResult = isRestaurantOpen(settings);
      if (!statusResult.isOpen) {
        return NextResponse.json(
          {
            error: "Restaurant is closed",
            message: statusResult.message
          },
          { status: 403 }
        );
      }
    } else {
      console.warn("[API_DB_WARN]: restaurant_settings row not found, allowing order placement fallback.", settingsError);
    }

    const productIds = items.map(i => i.productId);
    const { data: dbProducts, error: fetchError } = await supabase
      .from("products")
      .select("id, name, price, discount_price, is_available, restaurant_id")
      .in("id", productIds);

    if (fetchError || !dbProducts) {
      console.error("[API_DB_ERROR]: Failed to verify products", fetchError);
      return NextResponse.json({ error: "System busy, please try again" }, { status: 500 });
    }

    const dbProductMap = new Map(dbProducts.map(p => [p.id, p]));
    let verifiedTotal = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const dbProduct = dbProductMap.get(item.productId);

      if (!dbProduct) {
        return NextResponse.json({ error: `Product "${item.name}" is no longer available.` }, { status: 400 });
      }

      if (!dbProduct.is_available) {
        return NextResponse.json({ error: `Product "${dbProduct.name}" is currently out of stock.` }, { status: 400 });
      }

      if (dbProduct.restaurant_id !== RESTAURANT_ID) {
        return NextResponse.json({ error: "Invalid order data detected." }, { status: 403 });
      }

      // Secure price calculation: Prioritize discount_price from DB
      const unitPrice = dbProduct.discount_price ? Number(dbProduct.discount_price) : Number(dbProduct.price);
      const subtotal = unitPrice * item.quantity;
      verifiedTotal += subtotal;

      itemsToInsert.push({
        product_id: dbProduct.id,
        product_name: dbProduct.name, // Snapshot name
        quantity: item.quantity,
        price: unitPrice,
        note: item.note ?? null,
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: RESTAURANT_ID,
        name,
        phone,
        address,
        notes: notes ?? null,
        total: verifiedTotal,
        status: "pending",
        payment_status: "unpaid",
        print_status: "pending",
      })
      .select("*")
      .single();

    if (orderError || !order) {
      console.error("[API_INSERT_ERROR]: Order header failed", orderError);
      return NextResponse.json({ error: "Failed to initialize order" }, { status: 500 });
    }

    const finalItems = itemsToInsert.map(i => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(finalItems);

    if (itemsError) {
      console.error("[API_INSERT_ERROR]: Order items failed", itemsError);
      return NextResponse.json({ error: "Order partially saved. Please contact support." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
        status: order.status,
      },
    });

  } catch (e) {
    console.error("[API_CRASH]:", e);
    return NextResponse.json(
      { error: "A server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
