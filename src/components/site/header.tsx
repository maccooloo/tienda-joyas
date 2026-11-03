"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { brand } from "@/src/config/brand";
import { currentEra, eras, eraHref } from "@/src/config/eras";
import { catalogCategories } from "@/src/config/catalog";
import { CartButton } from "@/src/components/site/cart-button";

type Panel = "shop" | "collections" | "brand";
const panelNames = { shop: "Shop", collections: "Colecciones", brand: "La marca" };

function PathnameReporter({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();

  useEffect(() => {
    onChange(pathname);
  }, [onChange, pathname]);

  return null;
}

export function SiteHeader({ isMockShop }: { isMockShop: boolean }) {
  const [pathname, setPathname] = useState("");
  const isFilmPage = pathname === "/" || pathname === "/manifiesto";
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
  }, [cancelClose, pathname]);

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
    <header className={`site-header ${isFilmPage ? "site-header-film" : ""} ${isScrolled ? "site-header-scrolled" : ""} ${isHidden && !isOpen ? "site-header-hidden" : ""} ${isMockShop && !isScrolled ? "site-header-demo" : ""} ${isOpen ? "site-header-menu-open" : ""}`} onPointerLeave={scheduleClose}>
      <Link className="brand-mark" href="/" aria-label={`${brand.name}, inicio`} onClick={close}>{brand.wordmark}</Link>
      <nav className="desktop-nav" aria-label="Navegación principal">
        {(["shop", "collections", "brand"] as const).map((item) => <button key={item} className={`shop-menu-trigger ${item !== "shop" ? "desktop-only-trigger" : ""}`} type="button" aria-expanded={panel === item} aria-controls={panel === item ? "shop-menu" : undefined}
          onPointerEnter={(event) => open(item, false, event.currentTarget)} onClick={(event) => open(item, true, event.currentTarget)}>
          <span className="desktop-shop-label">{panelNames[item]}</span>{item === "shop" && <span className="mobile-shop-label">Menú</span>}
        </button>)}
      </nav>
      <div className="header-actions" onPointerEnter={close}><CartButton /></div>
    </header>
    <Suspense fallback={null}><PathnameReporter onChange={setPathname} /></Suspense>
    {panel && <div className={`shop-menu-backdrop ${modal ? "is-modal" : "is-hover"}`} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onPointerMove={(event) => { if (event.target === event.currentTarget) scheduleClose(); }}>
      <div ref={menuRef} id="shop-menu" className="shop-menu-panel" role={modal ? "dialog" : undefined} aria-modal={modal || undefined} aria-label={panelNames[panel]} onPointerEnter={cancelClose} onPointerLeave={scheduleClose}
        onBlur={(event) => { if (!modal && !event.currentTarget.contains(event.relatedTarget)) close(); }}>
        <div className="shop-menu-heading"><span>{panelNames[panel]}</span><button type="button" onClick={close}>Cerrar <span aria-hidden="true">×</span></button></div>
        <div className="mobile-menu-sections" aria-label="Secciones del menú">
          {(["shop", "collections", "brand"] as const).map((item) => <button type="button" key={item} aria-pressed={panel === item} onClick={() => setPanel(item)}>{panelNames[item]}</button>)}
        </div>
        <nav aria-label="Explorar la tienda">
          {panel === "shop" && <>
            <Link href="/shop" className="menu-all-pieces" onClick={close}>Todas las piezas disponibles</Link>
            {catalogCategories.map((category) => <Link href={`/shop?tipo=${category.slug}`} key={category.slug} onClick={close}>{category.title}</Link>)}
          </>}
          {panel === "collections" && <>
            {eras.map((era) => <Link key={era.slug} href={eraHref(era)} className="menu-era-link" onClick={close}><span>{era.title}</span><small>{era.status === "current" ? "Colección actual" : "Por venir"}</small></Link>)}
          </>}
          {panel === "brand" && <>
            <Link href="/manifiesto" onClick={close}>El universo {brand.name}</Link>
            <Link href="/manifiesto#manifiesto" onClick={close}>Nuestro manifiesto</Link>
            <Link href="/#ayuda" onClick={close}>Ayuda y cuidados</Link>
          </>}
        </nav>
        <div className={`menu-editorials ${panel === "shop" ? "menu-products" : ""}`}>
          {panel === "shop" ? <>
            <Link className="shop-menu-feature" href="/shop?tipo=collares" onClick={close}><span>Collares</span><div><Image src="/images/products/collar-de-cadena-bano-de-oro.webp" alt="" fill sizes="230px" /></div></Link>
            <Link className="shop-menu-feature" href="/shop?tipo=pendientes" onClick={close}><span>Pendientes</span><div><Image src="/images/products/large-waterproof-gold-plated-hoop-earrings.webp" alt="" fill sizes="230px" /></div></Link>
          </> : panel === "brand" ? <Link className="shop-menu-feature menu-brand-feature" href="/manifiesto" onClick={close}><span>El arte sigue vivo</span><div><Image src="/images/eras/renacimiento.webp" alt="" fill sizes="480px" /></div></Link> : [currentEra, eras[1]].map((era) => <Link className="shop-menu-feature" href={eraHref(era)} key={era.slug} onClick={close}>
            <span>{era.title}</span><div><Image src={era.image} alt="" fill sizes="(max-width: 760px) 40vw, 230px" /></div>
          </Link>)}
        </div>
      </div>
    </div>}
  </>;
}
