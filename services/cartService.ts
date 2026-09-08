import prisma from "../lib/db";

export async function getOrCreateCart(userId?: string, sessionToken?: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({
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
                seller: { select: { storeName: true, storeSlug: true } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                  orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
                  take: 1,
                },
                  seller: { select: { storeName: true, storeSlug: true } },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  if (sessionToken) {
    let cart = await prisma.cart.findUnique({
      where: { sessionToken },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
                  take: 1,
                },
                seller: { select: { storeName: true, storeSlug: true } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionToken },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                  orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
                  take: 1,
                },
                  seller: { select: { storeName: true, storeSlug: true } },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  throw new Error("Either userId or sessionToken is required to get or create cart");
}

export async function addToCart(params: {
  userId?: string;
  sessionToken?: string;
  productId: string;
  variantId?: string;
  quantity?: number;
}) {
  const { userId, sessionToken, productId, variantId, quantity = 1 } = params;

  // Validate product and stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product || product.status !== "ACTIVE") {
    throw new Error("Product is unavailable or out of stock.");
  }

  let availableStock = product.stockQuantity;
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) throw new Error("Product variant not found.");
    availableStock = variant.stockQuantity;
  }

  if (availableStock < quantity) {
    throw new Error(`Only ${availableStock} items in stock.`);
  }

  const cart = await getOrCreateCart(userId, sessionToken);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > availableStock) {
      throw new Error(`Cannot add more. Stock limit of ${availableStock} reached.`);
    }

    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
      quantity,
    },
  });
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true, variant: true },
  });

  if (!item) throw new Error("Cart item not found.");

  const availableStock = item.variant ? item.variant.stockQuantity : item.product.stockQuantity;
  if (quantity > availableStock) {
    throw new Error(`Requested quantity exceeds available stock (${availableStock}).`);
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

export async function removeFromCart(cartItemId: string) {
  return prisma.cartItem.delete({ where: { id: cartItemId } });
}

export async function clearCart(cartId: string) {
  return prisma.cartItem.deleteMany({ where: { cartId } });
}
