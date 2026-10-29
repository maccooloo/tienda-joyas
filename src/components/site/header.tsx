"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { brand } from "@/src/config/brand";
import { CartButton } from "@/src/components/site/cart-button";

export function SiteHeader({ isMockShop }: { isMockShop: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 24);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
      if (event.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
      const first = focusable?.[0];
      const last = focusable?.[focusable.length - 1];
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
      requestAnimationFrame(() => trigger?.focus());
    };
  }, [isMenuOpen]);

  return (
    <>
      {isMockShop && (
        <div className="demo-notice">
          Catálogo de demostración: precios, disponibilidad y checkout son ficticios.
        </div>
      )}
      <header className={`site-header ${isScrolled ? "site-header-scrolled" : ""} ${isMockShop && !isScrolled ? "site-header-demo" : ""}`}>
        <Link className="brand-mark" href="/" aria-label={`${brand.name}, inicio`}>
          {brand.wordmark}
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link href="/#coleccion">Colección Grecia</Link>
          <Link href="/#historia">La historia</Link>
        </nav>
        <div className="header-actions">
          <CartButton />
          <button
            ref={triggerRef}
            className="mobile-nav-trigger"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(true)}
          >Menú</button>
        </div>
      </header>
      {isMenuOpen && (
        <div ref={menuRef} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú principal">
          <button className="mobile-menu-close" type="button" onClick={() => setIsMenuOpen(false)}>Cerrar</button>
          <Link className="mobile-menu-brand" href="/" onClick={() => setIsMenuOpen(false)}>{brand.wordmark}</Link>
          <nav aria-label="Navegación móvil">
            <Link href="/#coleccion" onClick={() => setIsMenuOpen(false)}>Colección Grecia</Link>
            <Link href="/#historia" onClick={() => setIsMenuOpen(false)}>La historia</Link>
          </nav>
          <span className="mobile-menu-tagline">{brand.tagline}</span>
        </div>
      )}
    </>
  );
}
