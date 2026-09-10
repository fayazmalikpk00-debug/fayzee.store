import { getSessionUser } from "@/lib/auth";
import { createOrder } from "@/services/orderService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to checkout." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { shippingAddress, paymentMethod, paymentDetails, couponCode, notes } = body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      return NextResponse.json(
        { error: "Complete shipping address (Full Name, Phone, Street, City) is required." },
        { status: 400 }
      );
    }

    const validMethods = ["COD", "ONLINE_CARD", "JAZZ_CASH", "EASYPAISA", "WALLET"];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Please select a valid payment method (Cash on Delivery, Debit/Credit Card, JazzCash, or EasyPaisa)." },
        { status: 400 }
      );
    }

    const result = await createOrder({
      userId: user.id,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      couponCode,
      notes,
    });

    return NextResponse.json({
      message: "Order placed successfully!",
      order: result.order,
      paymentResult: result.paymentResult,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order." },
      { status: 400 }
    );
  }
}
