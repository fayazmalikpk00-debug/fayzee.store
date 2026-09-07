import { getSessionUser } from "@/lib/auth";
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

function getSessionToken() {
  const cookieStore = cookies();
  let token = cookieStore.get("fayzee_cart_session")?.value;
  if (!token) {
    token = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    cookies().set("fayzee_cart_session", token, {
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
    const sessionToken = user ? undefined : getSessionToken();

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
    const sessionToken = user ? undefined : getSessionToken();

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

    await updateCartItemQuantity(cartItemId, quantity);
    const user = await getSessionUser();
    const sessionToken = user ? undefined : getSessionToken();
    const cart = await getOrCreateCart(user?.id, sessionToken);

    return NextResponse.json({ message: "Cart updated.", cart });
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
    const sessionToken = user ? undefined : getSessionToken();
    const cart = await getOrCreateCart(user?.id, sessionToken);

    if (isClearAll) {
      await clearCart(cart.id);
    } else if (cartItemId) {
      await removeFromCart(cartItemId);
    }

    const updatedCart = await getOrCreateCart(user?.id, sessionToken);
    return NextResponse.json({ message: "Cart item removed.", cart: updatedCart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
