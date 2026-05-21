import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { message: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Invalid Razorpay Webhook Signature");
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    await connectDb();

    let orderDbId = "";
    let rzOrderId = "";
    let rzPaymentId = "";

    if (event.event === "order.paid") {
      const orderEntity = event.payload.order.entity;
      orderDbId = orderEntity.notes?.orderId || orderEntity.receipt;
      rzOrderId = orderEntity.id;
    } else if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      orderDbId = paymentEntity.notes?.orderId;
      rzOrderId = paymentEntity.order_id;
      rzPaymentId = paymentEntity.id;
    }

    if (orderDbId) {
      const order = await Order.findById(orderDbId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paymentDetails = {
          razorpayOrderId: rzOrderId || order.paymentDetails?.razorpayOrderId,
          razorpayPaymentId: rzPaymentId || order.paymentDetails?.razorpayPaymentId || "",
          razorpaySignature: order.paymentDetails?.razorpaySignature || "",
        };
        await order.save();
        console.log(`✅ Webhook: Order ${orderDbId} updated to Paid.`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ RAZORPAY WEBHOOK ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
