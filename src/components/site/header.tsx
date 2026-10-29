"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { brand } from "@/src/config/brand";
import type { NavigationCollection } from "@/src/lib/editorial";
import { CartButton } from "@/src/components/site/cart-button";

type Panel = "shop" | "collections" | "brand";
const panelNames = { shop: "Shop", collections: "Colecciones", brand: "La marca" };

export function SiteHeader({ isMockShop, collections = [] }: { isMockShop: boolean; collections?: NavigationCollection[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [modal, setModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = useCallback(() => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  const close = useCallback(() => { cancelClose(); setPanel(null); }, [cancelClose]);

  useEffect(() => {
    let previousScroll = window.scrollY;
    function updateScrollState() {
      setIsScrolled(window.scrollY > 24);
      if (window.scrollY < 120) setIsHidden(false);
      else if (Math.abs(window.scrollY - previousScroll) > 6) setIsHidden(window.scrollY > previousScroll);
      previousScroll = window.scrollY;
    }
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => { window.removeEventListener("scroll", updateScrollState); cancelClose(); };
  }, [cancelClose]);

  const isOpen = panel !== null;
  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    if (modal) {
      document.body.style.overflow = "hidden";
      menuRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { close(); trigger?.focus(); }
      if (!modal || event.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
      const first = focusable?.[0];
      const last = focusable?.[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (modal) { document.body.style.overflow = previousOverflow; requestAnimationFrame(() => trigger?.focus()); }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, modal, close]);

  function open(next: Panel, clicked: boolean, target: HTMLElement) {
    cancelClose();
    if (!clicked && !window.matchMedia("(hover: hover) and (min-width: 761px)").matches) return;
    triggerRef.current = target;
    setModal(clicked);
    setPanel(next);
  }
  function scheduleClose() {
    cancelClose();
    if (!modal) closeTimer.current = setTimeout(close, 160);
  }

  return <>
    {isMockShop && <div className="demo-notice">Catálogo de demostración · Compras ficticias</div>}
    <header className={`site-header ${isScrolled ? "site-header-scrolled" : ""} ${isHidden && !isOpen ? "site-header-hidden" : ""} ${isMockShop && !isScrolled ? "site-header-demo" : ""} ${isOpen ? "site-header-menu-open" : ""}`} onPointerLeave={scheduleClose}>
      <Link className="brand-mark" href="/" aria-label={`${brand.name}, inicio`} onClick={close}>{brand.wordmark}</Link>
      <nav className="desktop-nav" aria-label="Navegación principal">
        {(["shop", "collections", "brand"] as const).map((item) => <button key={item} className={`shop-menu-trigger ${item !== "shop" ? "desktop-only-trigger" : ""}`} type="button" aria-expanded={panel === item} aria-controls={panel === item ? "shop-menu" : undefined}
          onPointerEnter={(event) => open(item, false, event.currentTarget)} onClick={(event) => open(item, true, event.currentTarget)}>
          <span className="desktop-shop-label">{panelNames[item]}</span>{item === "shop" && <span className="mobile-shop-label">Menú</span>}
        </button>)}
      </nav>
      <div className="header-actions" onPointerEnter={close}><CartButton /></div>
    </header>
    {panel && <div className={`shop-menu-backdrop ${modal ? "is-modal" : "is-hover"}`} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onPointerMove={(event) => { if (event.target === event.currentTarget) scheduleClose(); }}>
      <div ref={menuRef} id="shop-menu" className="shop-menu-panel" role={modal ? "dialog" : undefined} aria-modal={modal || undefined} aria-label={panelNames[panel]} onPointerEnter={cancelClose} onPointerLeave={scheduleClose}
        onBlur={(event) => { if (!modal && !event.currentTarget.contains(event.relatedTarget)) close(); }}>
        <div className="shop-menu-heading"><span>{panelNames[panel]}</span><button type="button" onClick={close}>Cerrar <span aria-hidden="true">×</span></button></div>
        <nav aria-label="Explorar la tienda">
          {panel !== "brand" && <>
            <Link href="/#coleccion" onClick={close}>Todas las piezas</Link>
            {collections.map((collection) => <Link key={collection.href} href={collection.href} onClick={close}>{collection.title}</Link>)}
            {!collections.length && <Link href="/#colecciones" onClick={close}>Las colecciones</Link>}
          </>}
          <Link className="menu-secondary-link" href="/manifiesto" onClick={close}>El universo {brand.name}</Link>
          <Link href="/#ayuda" onClick={close}>Ayuda</Link>
        </nav>
        <div className="menu-editorials">
          {(collections.length ? collections.slice(0, 2) : [{ href: "/manifiesto", title: "Arte para llevar", image: "/images/art-botticelli.webp" }]).map((collection) => <Link className="shop-menu-feature" href={collection.href} key={collection.href} onClick={close}>
            <span>{collection.title}</span><div>{collection.image && <Image src={collection.image} alt="" fill sizes="(max-width: 760px) 40vw, 230px" />}</div>
          </Link>)}
        </div>
      </div>
    </div>}
  </>;
}
