"use client";

import { useState } from "react";
import { useCart } from "@/src/components/cart/cart-provider";
import { formatMoney } from "@/src/lib/format";
import type { Product, ProductVariant } from "@/src/lib/shopify/types";

function getInitialVariant(variants: ProductVariant[]) {
  return variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null;
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const initialVariant = getInitialVariant(product.variants);
  const [variantId, setVariantId] = useState(initialVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { addItem, isPending } = useCart();
  const selectedVariant = product.variants.find((variant) => variant.id === variantId) ?? initialVariant;
  const maximumQuantity = Math.max(1, Math.min(selectedVariant?.quantityAvailable ?? 10, 10));

  function handleAdd() {
    if (!selectedVariant?.availableForSale) return;
    addItem(variantId, quantity, {
      title: selectedVariant.title,
      productTitle: product.title,
      price: selectedVariant.price,
      image: selectedVariant.image ?? product.featuredImage,
    });
    setMessage("Añadido a tu bolsa.");
  }

  return (
    <div className="purchase-panel">
      <label className="field-label" htmlFor="product-variant">Variante</label>
      <select
        id="product-variant"
        className="select-field"
        value={variantId}
        onChange={(event) => setVariantId(event.target.value)}
        disabled={product.variants.length === 0}
      >
        {product.variants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.title === "Default Title" ? "Edición única" : variant.title} · {formatMoney(variant.price)}
          </option>
        ))}
      </select>

      <p className={`availability ${selectedVariant?.availableForSale ? "is-available" : "is-unavailable"}`}>
        <span aria-hidden="true" />
        {selectedVariant?.availableForSale ? "Disponible" : "Agotado"}
      </p>

      <div className="purchase-actions">
        <label className="visually-hidden" htmlFor="product-quantity">Cantidad</label>
        <input
          id="product-quantity"
          className="quantity-input"
          type="number"
          min={1}
          max={maximumQuantity}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(maximumQuantity, Number(event.target.value) || 1)))}
        />
        <button
          className="button button-gold add-button"
          onClick={handleAdd}
          disabled={!selectedVariant?.availableForSale || isPending || !selectedVariant}
        >
          {isPending ? "Añadiendo..." : "Añadir al carrito"}
        </button>
      </div>
      <div className="mobile-purchase-bar">
        <span className="mobile-purchase-price">{selectedVariant ? formatMoney(selectedVariant.price) : formatMoney(product.price)}</span>
        <button
          className="button button-gold"
          onClick={handleAdd}
          disabled={!selectedVariant?.availableForSale || isPending || !selectedVariant}
        >{isPending ? "Añadiendo..." : "Añadir al carrito"}</button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{message}</p>
    </div>
  );
}