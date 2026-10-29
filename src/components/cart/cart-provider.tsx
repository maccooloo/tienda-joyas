"use client";

import {
  createContext,
  useCallback,
  use,
  useRef,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { addItemToCart, removeItemFromCart, setCartItemQuantity } from "@/src/lib/shopify/cart-actions";
import type { Cart, Money, ShopifyImage } from "@/src/lib/shopify/types";

type OptimisticVariant = {
  title: string;
  productTitle: string;
  price: Money;
  image: ShopifyImage | null;
};

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity: number, variant: OptimisticVariant) => void;
  changeQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearError: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function optimisticallySetCart(current: Cart | null, next: Cart | null) {
  return next ?? current;
}

export function CartProvider({ initialCart, children }: { initialCart: Cart | null; children: ReactNode }) {
  const [savedCart, setSavedCart] = useState(initialCart);
  const [cart, setOptimisticCart] = useOptimistic(savedCart, optimisticallySetCart);
  const [isPending, startAction] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openCart = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);

  function runCartAction(optimisticCart: Cart | null, action: () => Promise<Cart>) {
    setError(null);
    startAction(async () => {
      setOptimisticCart(optimisticCart);
      try {
        const updatedCart = await action();
        setSavedCart(updatedCart);
        setOptimisticCart(updatedCart);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo actualizar el carrito.");
      }
    });
  }

  function addItem(variantId: string, quantity: number, variant: OptimisticVariant) {
    const existingLine = cart?.lines.find((line) => line.merchandiseId === variantId);
    const lineTotal = (Number(variant.price.amount) * quantity).toFixed(2);
    const nextCart: Cart = {
      id: cart?.id ?? "",
      checkoutUrl: cart?.checkoutUrl ?? "",
      totalQuantity: (cart?.totalQuantity ?? 0) + quantity,
      subtotal: {
        ...(cart?.subtotal ?? variant.price),
        amount: (Number(cart?.subtotal.amount ?? 0) + Number(lineTotal)).toFixed(2),
      },
      lines: existingLine && cart
        ? cart.lines.map((line) => line.id === existingLine.id
          ? {
              ...line,
              quantity: line.quantity + quantity,
              totalPrice: { ...line.totalPrice, amount: (Number(line.totalPrice.amount) + Number(lineTotal)).toFixed(2) },
            }
          : line)
        : [
            ...(cart?.lines ?? []),
            {
              id: `pending-${variantId}`,
              merchandiseId: variantId,
              title: variant.productTitle,
              variantTitle: variant.title,
              image: variant.image,
              quantity,
              unitPrice: variant.price,
              totalPrice: { ...variant.price, amount: lineTotal },
            },
          ],
    };

    if (!isOpen) openCart();
    runCartAction(nextCart, () => addItemToCart(variantId, quantity));
  }

  function changeQuantity(lineId: string, quantity: number) {
    if (quantity < 1) {
      removeLine(lineId);
      return;
    }
    if (!cart) return;

    const line = cart.lines.find((entry) => entry.id === lineId);
    if (!line) return;
    const delta = quantity - line.quantity;
    const amount = Number(line.unitPrice.amount) * quantity;
    const optimisticCart = {
      ...cart,
      totalQuantity: cart.totalQuantity + delta,
      subtotal: { ...cart.subtotal, amount: (Number(cart.subtotal.amount) + Number(line.unitPrice.amount) * delta).toFixed(2) },
      lines: cart.lines.map((entry) => entry.id === lineId
        ? { ...entry, quantity, totalPrice: { ...entry.totalPrice, amount: amount.toFixed(2) } }
        : entry),
    };

    runCartAction(optimisticCart, () => setCartItemQuantity(lineId, quantity));
  }

  function removeLine(lineId: string) {
    if (!cart) return;
    const line = cart.lines.find((entry) => entry.id === lineId);
    if (!line) return;
    const optimisticCart = {
      ...cart,
      totalQuantity: Math.max(0, cart.totalQuantity - line.quantity),
      subtotal: {
        ...cart.subtotal,
        amount: Math.max(0, Number(cart.subtotal.amount) - Number(line.totalPrice.amount)).toFixed(2),
      },
      lines: cart.lines.filter((entry) => entry.id !== lineId),
    };

    runCartAction(optimisticCart, () => removeItemFromCart(lineId));
  }

  const value: CartContextValue = {
    cart,
    isOpen,
    isPending,
    error,
    openCart,
    closeCart,
    addItem,
    changeQuantity,
    removeLine,
    clearError: () => setError(null),
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}
