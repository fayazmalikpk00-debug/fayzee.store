import { getSessionUser } from "@/lib/auth";
import { getSellerOrders, updateSellerOrderItemStatus } from "@/services/orderService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const orderItems = await getSellerOrders(user.sellerProfile.id);
    return NextResponse.json({ orderItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const fulfillmentStatus = body.fulfillmentStatus || body.status;
    const { orderItemId, trackingNumber } = body;

    if (!orderItemId || !fulfillmentStatus) {
      return NextResponse.json(
        { error: "Order Item ID and fulfillment status are required." },
        { status: 400 }
      );
    }

    const updated = await updateSellerOrderItemStatus(
      orderItemId,
      user.sellerProfile.id,
      fulfillmentStatus,
      trackingNumber
    );

    return NextResponse.json({
      message: "Order item fulfillment status updated.",
      updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
