import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  addToCart,
  clearCart,
  getOrCreateCart,
  removeFromCart,
  updateCartItemQuantity,
} from "@/services/cartService";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSessionToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get("fayzee_cart_session")?.value;
  if (!token) {
    token = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    cookieStore.set("fayzee_cart_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  }
  return token;
}

export async function GET() {
  try {
    const user = await getSessionUser();
    const sessionToken = user ? undefined : await getSessionToken();

    const cart = await getOrCreateCart(user?.id, sessionToken);
    return NextResponse.json({ cart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const user = await getSessionUser();
    const sessionToken = user ? undefined : await getSessionToken();

    const item = await addToCart({
      userId: user?.id,
      sessionToken,
      productId,
      variantId,
      quantity: quantity || 1,
    });

    const cart = await getOrCreateCart(user?.id, sessionToken);

    return NextResponse.json({ message: "Added to cart.", item, cart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { error: "Cart item ID and quantity are required." },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const sessionToken = user ? undefined : await getSessionToken();
    const cart = await getOrCreateCart(user?.id, sessionToken);

    // Verify ownership: ensure cart item belongs to caller's cart
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.cartId !== cart.id) {
      return NextResponse.json(
        { error: "Cart item not found or unauthorized access." },
        { status: 403 }
      );
    }

    await updateCartItemQuantity(cartItemId, quantity);
    const updatedCart = await getOrCreateCart(user?.id, sessionToken);

    return NextResponse.json({ message: "Cart updated.", cart: updatedCart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("cartItemId");
    const isClearAll = searchParams.get("clear") === "true";

    const user = await getSessionUser();
    const sessionToken = user ? undefined : await getSessionToken();
    const cart = await getOrCreateCart(user?.id, sessionToken);

    if (isClearAll) {
      await clearCart(cart.id);
    } else if (cartItemId) {
      // Verify ownership: ensure cart item belongs to caller's cart
      const item = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
      });

      if (!item || item.cartId !== cart.id) {
        return NextResponse.json(
          { error: "Cart item not found or unauthorized access." },
          { status: 403 }
        );
      }

      await removeFromCart(cartItemId);
    }

    const updatedCart = await getOrCreateCart(user?.id, sessionToken);
    return NextResponse.json({ message: "Cart item removed.", cart: updatedCart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
