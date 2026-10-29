"use client";

import { useCart } from "@/src/components/cart/cart-provider";

export function CartButton() {
  const { cart, openCart } = useCart();

  return (
    <button className="cart-trigger" onClick={openCart} aria-label={`Abrir carrito, ${cart?.totalQuantity ?? 0} artículos`}>
      Carrito <span className="cart-count" aria-live="polite">{cart?.totalQuantity ?? 0}</span>
    </button>
  );
}