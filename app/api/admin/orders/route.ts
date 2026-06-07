import { NextRequest, NextResponse } from "next/server";
import { createOrder, updateOrder, getAllOrders, deleteOrder, markUserPaid } from "@/lib/db";
import type { OrderRecord } from "@/lib/db";

const AUTO_SERVICES = ["linkedin", "naukri", "ats"];

function auth(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  const okPw = pw ? req.headers.get("x-admin-password") === pw : false;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, service, orderStatus, paymentStatus, paymentAmount, handledBy, notes, orderDate } = body;

    if (!customerName || !customerEmail || !service)
      return NextResponse.json({ error: "customerName, customerEmail and service are required" }, { status: 400 });

    const order = await createOrder({
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone: customerPhone?.trim() || undefined,
      service,
      orderStatus: orderStatus ?? "new",
      paymentStatus: paymentStatus ?? "pending",
      paymentAmount: Number(paymentAmount) || 0,
      handledBy: handledBy?.trim() || "",
      notes: notes?.trim() || undefined,
      orderDate: orderDate ?? new Date().toISOString(),
    });

    // Grant service access if created directly as paid
    if (order.paymentStatus === "paid") {
      await markUserPaid(order.customerEmail, order.service);
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json() as Partial<OrderRecord> & { id: string };
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const allOrders = await getAllOrders();
    const existing = allOrders.find((o) => o.id === id);

    await updateOrder(id, updates);

    // When payment flips to "paid" → grant access + record payment
    if (updates.paymentStatus === "paid" && existing?.paymentStatus !== "paid") {
      const email = existing?.customerEmail;
      const service = updates.service ?? existing?.service;
      if (email && service) {
        await markUserPaid(email, service);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update order error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteOrder(id);
  return NextResponse.json({ success: true });
}
