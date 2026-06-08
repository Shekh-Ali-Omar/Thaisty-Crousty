import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RESTAURANT_ID } from "@/lib/constants";
import { createOrderSchema } from "@/lib/validations/order";

/**
 * PRODUCTION-GRADE ORDER API
 * Transforms the ordering flow into a robust database-first system.
 * Hardened to prevent price manipulation and verify product state.
 */
export async function POST(request: Request) {
  try {
    // 1. Environment Guard
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[API_CRITICAL]: Missing Supabase credentials in server environment.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 2. Input Validation
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      console.warn("[API_VALIDATION]: Invalid order payload received.");
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, address, notes, items } = parsed.data;
    const supabase = createAdminClient();

    // 3. HARDENED PRODUCT VERIFICATION
    // Fetch products from DB to verify price, availability, and ownership.
    const productIds = items.map(i => i.productId);
    const { data: dbProducts, error: fetchError } = await supabase
      .from("products")
      .select("id, name, price, is_available, restaurant_id")
      .in("id", productIds);

    if (fetchError || !dbProducts) {
      console.error("[API_DB_ERROR]: Failed to verify products", fetchError);
      return NextResponse.json({ error: "System busy, please try again" }, { status: 500 });
    }

    // 4. BUSINESS LOGIC CHECKS
    const dbProductMap = new Map(dbProducts.map(p => [p.id, p]));
    let verifiedTotal = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const dbProduct = dbProductMap.get(item.productId);

      // Check existence
      if (!dbProduct) {
        console.warn(`[API_AUDIT]: Product ${item.productId} not found in database.`);
        return NextResponse.json({ error: `Product "${item.name}" is no longer available.` }, { status: 400 });
      }

      // Check availability
      if (!dbProduct.is_available) {
        console.warn(`[API_AUDIT]: Attempted to order hidden product: ${dbProduct.name}`);
        return NextResponse.json({ error: `Product "${dbProduct.name}" is currently out of stock.` }, { status: 400 });
      }

      // Check restaurant ownership
      if (dbProduct.restaurant_id !== RESTAURANT_ID) {
        console.error(`[API_SECURITY]: Mismatch restaurant_id for product: ${dbProduct.id}`);
        return NextResponse.json({ error: "Invalid order data detected." }, { status: 403 });
      }

      const unitPrice = Number(dbProduct.price);
      const subtotal = unitPrice * item.quantity;
      verifiedTotal += subtotal;

      itemsToInsert.push({
        product_id: dbProduct.id,
        product_name: dbProduct.name, // Snapshot name
        quantity: item.quantity,
        price: unitPrice,
        note: item.note ?? null,
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`[ORDER_AUDIT]: Verified: ${dbProduct.name} | Qty: ${item.quantity} | Price: ${unitPrice}`);
      }
    }

    // 5. Create Order Header
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
      })
      .select("*")
      .single();

    if (orderError || !order) {
      console.error("[API_INSERT_ERROR]: Order header failed", orderError);
      return NextResponse.json({ error: "Failed to initialize order" }, { status: 500 });
    }

    // 6. Create Order Items
    const finalItems = itemsToInsert.map(i => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(finalItems);

    if (itemsError) {
      console.error("[API_INSERT_ERROR]: Order items failed", itemsError);
      // NOTE: In production, you would ideally use a database transaction (RPC) 
      // or cleanup the order header if items fail.
      return NextResponse.json({ error: "Order partially saved. Please contact support." }, { status: 500 });
    }

    console.log(`[API_SUCCESS]: Order ${order.order_number} verified and saved. Total: ${verifiedTotal}`);

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
