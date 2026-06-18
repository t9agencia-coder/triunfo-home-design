import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // PodPay webhook payload shape:
    // { success: true, data: { id, status, amount, paymentMethod, ... }, ... }
    if (body?.success && body?.data) {
      const { id, status } = body.data;
      console.log(`Transaction ${id} → ${status}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("webhook error:", error);
    return NextResponse.json({ received: false }, { status: 200 });
  }
}
