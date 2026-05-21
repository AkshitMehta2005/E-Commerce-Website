import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDbId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDbId) {
      return NextResponse.json(
        { message: "Missing required verification parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { message: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // Update order in database
    const order = await Order.findById(orderDbId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    order.isPaid = true;
    order.paymentDetails = {
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    };
    await order.save();

    return NextResponse.json(
      { success: true, message: "Payment verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ RAZORPAY VERIFY ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
