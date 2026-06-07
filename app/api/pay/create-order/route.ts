import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    if (!amount || amount < 1)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // rupees → paise
      currency: "INR",
      receipt: `svc_${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
