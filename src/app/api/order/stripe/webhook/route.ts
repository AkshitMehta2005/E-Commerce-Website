import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Stripe payment gateway is deprecated. Please use Razorpay." },
    { status: 410 }
  );
}