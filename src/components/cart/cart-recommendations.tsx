"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/src/components/cart/cart-provider";
import { formatMoney } from "@/src/lib/format";
import type { Product } from "@/src/lib/shopify/types";

type Suggestion = Pick<Product, "id" | "handle" | "title" | "featuredImage" | "variants">;

function SuggestedPiece({ product }: { product: Suggestion }) {
  const { addItem, isPending, closeCart } = useCart();
  const available = product.variants.filter((variant) => variant.availableForSale);
  const [selectedId, setSelectedId] = useState(available.length === 1 ? available[0].id : "");
  const variant = available.find((item) => item.id === selectedId);
  const image = variant?.image ?? product.featuredImage;
  return <div className="suggested-piece">
    <Link className="suggested-image" href={`/productos/${product.handle}`} onClick={closeCart} tabIndex={-1} aria-hidden="true">
      {image && <Image src={image.url} alt="" fill sizes="110px" />}
    </Link>
    <div className="suggested-copy">
      <Link href={`/productos/${product.handle}`} onClick={closeCart}>{product.title}</Link>
      <p>{variant ? formatMoney(variant.price) : `Desde ${formatMoney(available.reduce((a, b) => Number(a.price.amount) < Number(b.price.amount) ? a : b).price)}`}</p>
      <div className="suggested-actions">
        {available.length > 1 && <select aria-label={`Elige opción de ${product.title}`} value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={isPending}>
          <option value="" disabled>Elegir opción</option>
          {available.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>}
        <button type="button" disabled={!variant || isPending} onClick={(event) => {
          if (variant) {
            // The current suggestion disappears after adding; keep keyboard focus in the drawer.
            event.currentTarget.closest("[data-cart-dialog]")?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
            addItem(variant.id, 1, { title: variant.title, productTitle: product.title, price: variant.price, image });
          }
        }}>{isPending ? "Añadiendo…" : "Añadir"}</button>
      </div>
    </div>
  </div>;
}

export function CartRecommendations() {
  const { cart, isPending } = useCart();
  const [products, setProducts] = useState<Suggestion[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/recommendations", { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Recommendations unavailable");
      return response.json() as Promise<{ products: Suggestion[] }>;
    }).then((data) => setProducts(data.products)).catch(() => { /* Optional recommendations must not interrupt checkout. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCanAnimate(!preference.matches && !document.hidden);
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);

  const suggestions = products.filter((product) => !product.variants.some((variant) => cart?.lines.some((line) => line.merchandiseId === variant.id)));
  const count = suggestions.length;
  const product = suggestions[index % count];
  useEffect(() => {
    if (!canAnimate || paused || interacting || focused || isPending || count < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [canAnimate, paused, interacting, focused, isPending, count]);

  if (!product) return null;
  return <section className="cart-recommendations" aria-label="Completa tu selección" aria-roledescription="carrusel"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="recommendations-heading"><h3>Una pieza más</h3>
      {count > 1 && <div className="recommendation-controls">
        {canAnimate && <button type="button" aria-label={paused ? "Activar recomendaciones automáticas" : "Pausar recomendaciones automáticas"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "▷" : "Ⅱ"}</button>}
        <button type="button" aria-label="Recomendación anterior" disabled={isPending} onClick={() => setIndex((current) => (current + count - 1) % count)}>‹</button>
        <button type="button" aria-label="Recomendación siguiente" disabled={isPending} onClick={() => setIndex((current) => (current + 1) % count)}>›</button>
      </div>}
    </div>
    <div key={product.id} className="recommendation-slide" role="group" aria-roledescription="diapositiva" aria-label={`${index % count + 1} de ${count}`}>
      <SuggestedPiece product={product} />
    </div>
  </section>;
}
