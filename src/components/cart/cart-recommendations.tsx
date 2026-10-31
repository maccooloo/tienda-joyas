"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCart } from "@/src/components/cart/cart-provider";
import { formatMoney } from "@/src/lib/format";
import type { Product } from "@/src/lib/shopify/types";

type Suggestion = Pick<Product, "id" | "handle" | "title" | "featuredImage" | "variants">;

function SuggestedPiece({ product }: { product: Suggestion }) {
  const { addItem, isPending, closeCart } = useCart();
  const available = product.variants.filter((variant) => variant.availableForSale);
  const [selectedId, setSelectedId] = useState(available.length === 1 ? available[0].id : "");
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState(Math.max(0, available.findIndex((item) => item.id === selectedId)));
  const selectorId = useId();
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const variant = available.find((item) => item.id === selectedId);
  const image = variant?.image ?? product.featuredImage;

  useEffect(() => {
    if (isVariantOpen) optionRefs.current[activeVariantIndex]?.focus();
  }, [activeVariantIndex, isVariantOpen]);

  useEffect(() => {
    if (!isVariantOpen) return;
    function closeOnPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !selectorRef.current?.contains(event.target)) setIsVariantOpen(false);
    }
    document.addEventListener("pointerdown", closeOnPointerDown);
    return () => document.removeEventListener("pointerdown", closeOnPointerDown);
  }, [isVariantOpen]);

  function openVariantSelect(index = available.findIndex((item) => item.id === selectedId)) {
    setActiveVariantIndex(Math.max(0, index));
    setIsVariantOpen(true);
  }

  function handleVariantKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      setIsVariantOpen(false);
      triggerRef.current?.focus();
      return;
    }

    let nextIndex = activeVariantIndex;
    if (event.key === "ArrowDown") nextIndex = (activeVariantIndex + 1) % available.length;
    else if (event.key === "ArrowUp") nextIndex = (activeVariantIndex + available.length - 1) % available.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = available.length - 1;
    else return;

    event.preventDefault();
    setActiveVariantIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  }

  return <div className="suggested-piece">
    <Link className="suggested-image" href={`/productos/${product.handle}`} onClick={closeCart} tabIndex={-1} aria-hidden="true">
      {image && <Image src={image.url} alt="" fill sizes="110px" />}
    </Link>
    <div className="suggested-copy">
      <Link href={`/productos/${product.handle}`} onClick={closeCart}>{product.title}</Link>
      <p>{variant ? formatMoney(variant.price) : `Desde ${formatMoney(available.reduce((a, b) => Number(a.price.amount) < Number(b.price.amount) ? a : b).price)}`}</p>
      <div className="suggested-actions">
        {available.length > 1 && <div className="suggested-variant-select" ref={selectorRef} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsVariantOpen(false);
        }}>
          <button
            ref={triggerRef}
            className="suggested-variant-trigger"
            type="button"
            aria-label={`Variante de ${product.title}: ${variant?.title ?? "Elegir opción"}`}
            aria-haspopup="listbox"
            aria-expanded={isVariantOpen}
            aria-controls={selectorId}
            disabled={isPending}
            onClick={() => isVariantOpen ? setIsVariantOpen(false) : openVariantSelect()}
            onKeyDown={(event) => {
              if (!isVariantOpen && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                openVariantSelect(event.key === "ArrowUp" ? available.length - 1 : undefined);
              }
            }}
          >
            <span>{variant?.title ?? "Elegir opción"}</span>
            <span className="suggested-variant-chevron" aria-hidden="true" />
          </button>
          {isVariantOpen && <div id={selectorId} className="suggested-variant-listbox" role="listbox" aria-label={`Opciones de ${product.title}`} onKeyDown={handleVariantKeyDown}>
            {available.map((item, index) => <button
              key={item.id}
              ref={(element) => { optionRefs.current[index] = element; }}
              className="suggested-variant-option"
              type="button"
              role="option"
              aria-selected={item.id === selectedId}
              tabIndex={-1}
              onFocus={() => setActiveVariantIndex(index)}
              onClick={() => {
                setSelectedId(item.id);
                setIsVariantOpen(false);
                triggerRef.current?.focus();
              }}
            >
              <span>{item.title}</span>
              <span className="suggested-variant-check" aria-hidden="true">{item.id === selectedId ? "✓" : ""}</span>
            </button>)}
          </div>}
        </div>}
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
