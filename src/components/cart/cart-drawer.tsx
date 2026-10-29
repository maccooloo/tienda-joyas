"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BrandPlaceholder } from "@/src/components/brand/brand-placeholder";
import { brand } from "@/src/config/brand";
import { formatMoney } from "@/src/lib/format";
import { useCart } from "@/src/components/cart/cart-provider";

export function CartDrawer() {
  const { cart, isOpen, isPending, error, closeCart, changeQuantity, removeLine, clearError } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
      if (event.key !== "Tab") return;

      const focusable = document.querySelectorAll<HTMLElement>(
        "[data-cart-dialog] button:not(:disabled), [data-cart-dialog] a[href], [data-cart-dialog] input:not(:disabled)",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeCart();
    }}>
      <section
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        data-cart-dialog
      >
        <div className="cart-heading">
          <div>
            <p className="eyebrow">Tu selección</p>
            <h2 id="cart-title" className="section-title">Carrito <span>({cart?.totalQuantity ?? 0})</span></h2>
          </div>
          <button ref={closeButtonRef} className="icon-button" onClick={closeCart} aria-label="Cerrar bolsa">
            Cerrar
          </button>
        </div>

        {error && (
          <div className="cart-error" role="alert">
            <span>{error}</span>
            <button className="text-button" onClick={clearError}>Descartar</button>
          </div>
        )}

        {!cart?.lines.length ? (
          <div className="cart-empty">
            <p>{isPending ? "Actualizando el carrito..." : `Tu carrito está vacío. La colección ${brand.collectionLabel} te espera.`}</p>
            <button className="button button-dark" onClick={closeCart}>Seguir explorando</button>
          </div>
        ) : (
          <>
            <ul className="cart-lines" aria-busy={isPending}>
              {cart.lines.map((line) => (
                <li className="cart-line" key={line.id}>
                  <div className="cart-line-image">
                    {line.image ? (
                      <Image src={line.image.url} alt={line.image.altText ?? line.title} fill sizes="88px" />
                    ) : <BrandPlaceholder className="cart-placeholder" label={line.title} />}
                  </div>
                  <div className="cart-line-info">
                    <h3>{line.title}</h3>
                    {line.variantTitle !== "Default Title" && <p>{line.variantTitle}</p>}
                    <span>{formatMoney(line.unitPrice)}</span>
                    <div className="quantity-control" aria-label={`Cantidad de ${line.title}`}>
                      <button
                        aria-label={`Restar una unidad de ${line.title}`}
                        onClick={() => changeQuantity(line.id, line.quantity - 1)}
                        disabled={isPending || line.id.startsWith("pending-")}
                      >−</button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button
                        aria-label={`Añadir una unidad de ${line.title}`}
                        onClick={() => changeQuantity(line.id, line.quantity + 1)}
                        disabled={isPending || line.quantity >= 10 || line.id.startsWith("pending-")}
                      >+</button>
                    </div>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => removeLine(line.id)}
                    disabled={isPending || line.id.startsWith("pending-")}
                    aria-label={`Eliminar ${line.title}`}
                  >Eliminar</button>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <p><span>Subtotal</span><strong>{formatMoney(cart.subtotal)}</strong></p>
              <p className="cart-note">Envío e impuestos se calculan en Shopify.</p>
              {cart.checkoutUrl ? (
                <a className="button button-dark checkout-button" href={cart.checkoutUrl}>
                  Finalizar compra <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <button className="button button-dark checkout-button" disabled>
                  {isPending ? "Actualizando carrito..." : "Preparando checkout..."}
                </button>
              )}
              <Link href="/#coleccion" className="text-link" onClick={closeCart}>
                Seguir explorando
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}