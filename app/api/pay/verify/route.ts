import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder, markUserPaid, upsertUser } from "@/lib/db";

const AUTO_SERVICES = ["linkedin", "naukri", "ats"];

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, phone, service, requirements, amount } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return NextResponse.json({ verified: false }, { status: 400 });

    const emailLower = email.toLowerCase();

    // Ensure user record exists
    await upsertUser({ email: emailLower, name, phone: phone?.trim() || undefined });

    // Create a paid order record (appears immediately in admin Customers tab)
    await createOrder({
      customerName: name,
      customerEmail: emailLower,
      customerPhone: phone?.trim() || undefined,
      service,
      orderStatus: "new",
      paymentStatus: "paid",
      paymentAmount: Number(amount),
      handledBy: "",
      notes: requirements?.trim() || undefined,
      orderDate: new Date().toISOString(),
    });

    // For auto services (LinkedIn/Naukri/ATS) grant access immediately since payment is confirmed
    if (AUTO_SERVICES.includes(service)) {
      await markUserPaid(emailLower, service, razorpay_payment_id);
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("pay/verify error:", err);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
