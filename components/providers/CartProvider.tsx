"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItemType {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    shippingFee?: number;
    images: { url: string }[];
    seller?: { storeName: string; storeSlug: string };
  };
  variant?: {
    id: string;
    name: string;
    color?: string | null;
    size?: string | null;
    price: number;
    salePrice?: number | null;
    stockQuantity: number;
  } | null;
}

export interface CartType {
  id: string;
  items: CartItemType[];
}

export interface CartToastData {
  id: string;
  title: string;
  price: number;
  image?: string;
}

interface CartContextType {
  cart: CartType | null;
  cartCount: number;
  cartSubtotal: number;
  loading: boolean;
  toastItem: CartToastData | null;
  dismissToast: () => void;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  cartCount: 0,
  cartSubtotal: 0,
  loading: true,
  toastItem: null,
  dismissToast: () => {},
  addToCart: async () => false,
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastItem, setToastItem] = useState<CartToastData | null>(null);

  const dismissToast = () => setToastItem(null);

  useEffect(() => {
    if (toastItem) {
      const timer = setTimeout(() => {
        setToastItem(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastItem]);

  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, variantId?: string, quantity = 1): Promise<boolean> => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add product to cart.");
        return false;
      }
      if (data.cart) {
        setCart(data.cart);
        const addedItem = data.cart.items?.find((i: CartItemType) => i.productId === productId);
        if (addedItem) {
          setToastItem({
            id: addedItem.id,
            title: addedItem.product.title,
            price:
              addedItem.variant?.salePrice ||
              addedItem.variant?.price ||
              addedItem.product.salePrice ||
              addedItem.product.price,
            image: addedItem.product.images?.[0]?.url,
          });
        }
      } else {
        await refreshCart();
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      else await refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      else await refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`/api/cart?clear=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      else setCart(null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartSubtotal =
    cart?.items?.reduce((acc, item) => {
      const price =
        item.variant?.salePrice ??
        item.variant?.price ??
        item.product?.salePrice ??
        item.product?.price ??
        0;
      return acc + price * item.quantity;
    }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        loading,
        toastItem,
        dismissToast,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
