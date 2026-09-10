import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CourierService } from "@/services/courierService";
import { ConsignmentBookingRequest, CourierProviderType } from "@/lib/courier/types";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized. Seller account required." }, { status: 403 });
    }

    const body = await req.json();
    const { orderItemId, courierProvider, notes, weightInKg } = body;

    if (!orderItemId) {
      return NextResponse.json({ error: "Order Item ID is required." }, { status: 400 });
    }

    // Verify seller owns this order item
    const item = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        sellerId: user.sellerProfile.id,
      },
      include: {
        order: {
          include: {
            user: {
              select: { name: true, phone: true, email: true },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Order item not found or you are not authorized to dispatch it." },
        { status: 404 }
      );
    }

    // Parse customer shipping address
    let parsedAddress: any = null;
    try {
      if (item.order.shippingAddress) {
        parsedAddress =
          typeof item.order.shippingAddress === "string"
            ? JSON.parse(item.order.shippingAddress)
            : item.order.shippingAddress;
      }
    } catch {
      parsedAddress = null;
    }

    const consigneeCity = parsedAddress?.city || "Karachi";
    const consigneeName = parsedAddress?.fullName || item.order.user.name || "Customer";
    const consigneePhone = parsedAddress?.phone || item.order.user.phone || "03001234567";
    const consigneeStreet = [
      parsedAddress?.street,
      parsedAddress?.state,
      parsedAddress?.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || "Street address not specified";

    // Fetch full seller profile address and phone
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: user.sellerProfile.id },
      select: {
        storeName: true,
        address: true,
        phone: true,
      },
    });

    // Prepare Seller Pickup Address (Warehouse)
    const pickup = {
      storeName: seller?.storeName || user.sellerProfile.storeName || "Fayzee Seller",
      contactPerson: user.name || "Store Dispatcher",
      phone: seller?.phone || user.phone || "03001234567",
      street: seller?.address || "Seller Store Address, Pakistan",
      city: "Karachi", // Fallback city
    };

    const isCOD = item.order.paymentMethod === "COD";

    const bookingPayload: ConsignmentBookingRequest = {
      orderId: item.order.id,
      orderNumber: item.order.orderNumber,
      orderItemId: item.id,
      itemTitle: item.title,
      itemSku: item.sku,
      quantity: item.quantity,
      pieces: item.quantity,
      weightInKg: weightInKg ? Number(weightInKg) : 0.5,
      orderNotes: notes || item.order.notes || "",
      orderType: "Normal",
      paymentType: isCOD ? "COD" : "PREPAID",
      invoicePayment: isCOD ? item.total : 0,
      consignee: {
        name: consigneeName,
        phone: consigneePhone,
        street: consigneeStreet,
        city: consigneeCity,
        email: item.order.user.email,
      },
      pickup,
    };

    const result = await CourierService.bookOrderConsignment(
      bookingPayload,
      courierProvider as CourierProviderType
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Courier booking failed." }, { status: 400 });
    }

    return NextResponse.json({
      message: `Consignment successfully booked with ${result.provider}! Rider pickup scheduled.`,
      booking: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
