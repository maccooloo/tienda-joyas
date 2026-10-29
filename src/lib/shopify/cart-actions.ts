"use server";

import { cookies } from "next/headers";
import { addCartLine, createCart, getCartById, removeCartLine, updateCartLine } from "@/src/lib/shopify/storefront";
import type { Cart } from "@/src/lib/shopify/types";

const CART_COOKIE_NAME = "storefront-cart-id";

function setCartCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, cartId: string) {
  cookieStore.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function validateQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error("La cantidad debe estar entre 1 y 10.");
  }
}

export async function loadCart(): Promise<Cart | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) return null;

  const cart = await getCartById(cartId);
  if (!cart) cookieStore.delete(CART_COOKIE_NAME);
  return cart;
}

export async function addItemToCart(variantId: string, quantity: number) {
  if (!variantId || variantId.length > 256) throw new Error("Selecciona una variante valida.");
  validateQuantity(quantity);

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  const cart = cartId
    ? await addCartLine(cartId, variantId, quantity)
    : await createCart(variantId, quantity);

  setCartCookie(cookieStore, cart.id);
  return cart;
}

export async function setCartItemQuantity(lineId: string, quantity: number) {
  if (!lineId || lineId.length > 256) throw new Error("Linea de carrito no valida.");
  validateQuantity(quantity);

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) throw new Error("No se encontro el carrito.");

  const cart = await updateCartLine(cartId, lineId, quantity);
  setCartCookie(cookieStore, cart.id);
  return cart;
}

export async function removeItemFromCart(lineId: string) {
  if (!lineId || lineId.length > 256) throw new Error("Linea de carrito no valida.");

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) throw new Error("No se encontro el carrito.");

  const cart = await removeCartLine(cartId, lineId);
  if (cart.lines.length === 0) cookieStore.delete(CART_COOKIE_NAME);
  return cart;
}