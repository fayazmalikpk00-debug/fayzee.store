import prisma from "@/lib/db";
import { PaymentService } from "@/lib/payment";
import { PaymentDetailsPayload } from "@/lib/payment/types";

export interface CreateOrderInput {
  userId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentDetails?: PaymentDetailsPayload;
  couponCode?: string;
  notes?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const { userId, shippingAddress, paymentMethod, paymentDetails, couponCode, notes } = input;

  const [cart, user] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
                seller: true,
              },
            },
            variant: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    }),
  ]);

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // 2. Validate stock and recalculate real prices securely on server
  let subtotal = 0;
  let totalShipping = 0;
  const itemsToCreate: any[] = [];
  const stockUpdates: { productId: string; variantId?: string; quantity: number }[] = [];

  for (const item of cart.items) {
    const { product, variant, quantity } = item;

    if (product.status !== "ACTIVE") {
      throw new Error(`Product "${product.title}" is no longer available.`);
    }

    const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
    if (availableStock < quantity) {
      throw new Error(
        `Insufficient stock for "${product.title}" (${availableStock} available, ${quantity} in cart).`
      );
    }

    // Server-side authoritative price calculation
    const itemPrice = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price;
    const lineTotal = itemPrice * quantity;

    subtotal += lineTotal;
    totalShipping += (product.shippingFee || 0);

    itemsToCreate.push({
      productId: product.id,
      variantId: variant?.id || null,
      sellerId: product.sellerId,
      title: variant?.name ? `${product.title} (${variant.name})` : product.title,
      sku: variant?.sku || product.sku,
      price: itemPrice,
      quantity,
      total: lineTotal,
    });

    stockUpdates.push({
      productId: product.id,
      variantId: variant?.id,
      quantity,
    });
  }

  // 3. Handle Coupon discount if provided
  let discountTotal = 0;
  let appliedCouponId: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (coupon && coupon.isActive && new Date() <= coupon.endDate && new Date() >= coupon.startDate) {
      if (subtotal >= coupon.minOrderAmount) {
        if (coupon.usageLimit > coupon.usedCount) {
          // Check per-user limit
          const userUsages = await prisma.couponUsage.count({
            where: { couponId: coupon.id, userId },
          });

          if (userUsages < coupon.perUserLimit) {
            appliedCouponId = coupon.id;
            if (coupon.discountType === "PERCENTAGE") {
              const calculated = (subtotal * coupon.discountValue) / 100;
              discountTotal = coupon.maxDiscountAmount
                ? Math.min(calculated, coupon.maxDiscountAmount)
                : calculated;
            } else {
              discountTotal = Math.min(coupon.discountValue, subtotal);
            }
          }
        }
      }
    }
  }

  const grandTotal = Math.max(0, subtotal - discountTotal + totalShipping);

  // Generate unique order number: FYZ-YYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `FYZ-${dateStr}-${randomSuffix}`;

  // 4. Atomic Transaction: create order, decrement stock, clear cart, create payment
  const result = await prisma.$transaction(async (tx) => {
    // A. Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        discountTotal,
        shippingTotal: totalShipping,
        taxTotal: 0,
        grandTotal,
        status: "PENDING",
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PROCESSING",
        shippingAddress: JSON.stringify(shippingAddress),
        notes: notes || null,
        items: {
          create: itemsToCreate.map((item) => ({
            ...item,
            fulfillmentStatus: "PENDING",
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // B. Decrement stock atomically
    for (const update of stockUpdates) {
      if (update.variantId) {
        await tx.productVariant.update({
          where: { id: update.variantId },
          data: { stockQuantity: { decrement: update.quantity } },
        });
      }
      await tx.product.update({
        where: { id: update.productId },
        data: { stockQuantity: { decrement: update.quantity } },
      });
    }

    // C. Record coupon usage if applied
    if (appliedCouponId) {
      await tx.couponUsage.create({
        data: {
          couponId: appliedCouponId,
          userId,
          orderId: order.id,
          discountAmount: discountTotal,
        },
      });
      await tx.coupon.update({
        where: { id: appliedCouponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // D. Process Payment through payment abstraction
    const paymentConfig = await PaymentService.getConfig();
    const paymentProvider = PaymentService.getProvider(paymentMethod, paymentConfig);
    const paymentResult = await paymentProvider.processPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: grandTotal,
      currency: "PKR",
      customerEmail: user?.email || "customer@fayzee.store",
      customerName: shippingAddress.fullName,
      customerPhone: shippingAddress.phone,
      paymentDetails,
    });

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || "Payment transaction was declined by the gateway.");
    }

    // E. Create Payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        paymentMethod,
        transactionId: paymentResult.transactionId,
        amount: grandTotal,
        status: paymentResult.status,
        gatewayResponse: JSON.stringify(paymentResult),
      },
    });

    // Update order payment status if paid immediately
    if (paymentResult.status === "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID" },
      });
    }

    // F. Clear Cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // G. Create in-app Notification for customer
    await tx.notification.create({
      data: {
        userId,
        title: "Order Placed Successfully! 🎉",
        message: `Your order #${order.orderNumber} for Rs. ${Math.round(grandTotal).toLocaleString()} has been confirmed.`,
        type: "ORDER",
        link: `/orders/${order.id}`,
      },
    });

    return { order, paymentResult };
  });

  return result;
}

export async function getCustomerOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string, userId?: string) {
  const where: any = { id: orderId };
  if (userId) where.userId = userId;

  return prisma.order.findFirst({
    where,
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
            },
          },
          seller: {
            select: {
              storeName: true,
              storeSlug: true,
            },
          },
        },
      },
      payments: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

// Scoped to seller so a seller can ONLY view and update items belonging to their store
export async function getSellerOrders(sellerId: string) {
  const items = await prisma.orderItem.findMany({
    where: { sellerId },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
      },
      product: {
        include: {
          images: { take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => {
    let parsedAddress: any = null;
    try {
      if (item.order.shippingAddress) {
        parsedAddress = typeof item.order.shippingAddress === "string"
          ? JSON.parse(item.order.shippingAddress)
          : item.order.shippingAddress;
      }
    } catch {
      parsedAddress = null;
    }

    return {
      ...item,
      order: {
        ...item.order,
        parsedShippingAddress: parsedAddress,
      },
    };
  });
}

export async function updateSellerOrderItemStatus(
  orderItemId: string,
  sellerId: string,
  status: string,
  trackingNumber?: string
) {
  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, sellerId },
    include: {
      order: true,
    },
  });

  if (!item) {
    throw new Error("Order item not found or you are not authorized to manage it.");
  }

  // 1. Update this specific order item's fulfillment status
  const updatedItem = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { fulfillmentStatus: status },
  });

  // 2. Fetch all items for this parent order to calculate aggregate order status
  const allOrderItems = await prisma.orderItem.findMany({
    where: { orderId: item.orderId },
  });

  const statuses = allOrderItems.map((i) => i.fulfillmentStatus);
  let newOrderStatus = item.order.status;

  if (statuses.every((s) => s === "DELIVERED")) {
    newOrderStatus = "DELIVERED";
  } else if (statuses.some((s) => s === "SHIPPED")) {
    newOrderStatus = "SHIPPED";
  } else if (statuses.some((s) => s === "PROCESSING" || s === "CONFIRMED")) {
    newOrderStatus = "PROCESSING";
  } else if (statuses.every((s) => s === "CANCELLED")) {
    newOrderStatus = "CANCELLED";
  } else if (statuses.every((s) => s === "PENDING")) {
    newOrderStatus = "PENDING";
  }

  // 3. Update parent order status and tracking info
  const orderUpdateData: any = {
    status: newOrderStatus,
    updatedAt: new Date(),
  };

  if (trackingNumber) {
    orderUpdateData.trackingNumber = trackingNumber;
  }

  // If order is delivered and payment was COD, update paymentStatus to PAID
  if (newOrderStatus === "DELIVERED" && item.order.paymentMethod === "COD") {
    orderUpdateData.paymentStatus = "PAID";
    await prisma.payment.updateMany({
      where: { orderId: item.orderId },
      data: { status: "PAID", updatedAt: new Date() },
    });
  }

  await prisma.order.update({
    where: { id: item.orderId },
    data: orderUpdateData,
  });

  return updatedItem;
}

