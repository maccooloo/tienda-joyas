import { Suspense } from "react";
import Link from "next/link";
import { CampaignHero } from "@/src/components/home/campaign-hero";
import { EraCollections, EraNavigation } from "@/src/components/home/era-collections";
import { ProductCard } from "@/src/components/products/product-card";
import { brand } from "@/src/config/brand";
import { currentEra, eraHref } from "@/src/config/eras";
import { getEraProducts } from "@/src/lib/era-products";

async function HomeSelection() {
  const products = await getEraProducts(currentEra).catch(() => []);
  return <section id="coleccion" className="shop-selection" aria-labelledby="selection-title">
    <div className="shop-section-bar"><h2 id="selection-title">La selección de {currentEra.title}</h2><Link href="/shop">Ver todas las piezas</Link></div>
    {products.length ? <div className="product-grid home-product-grid era-current-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      : <p className="empty-state">No hemos podido cargar las piezas. <Link href={eraHref(currentEra)}>Ver la colección</Link></p>}
  </section>;
}

function SelectionFallback() {
  return <div className="selection-loading" aria-label="Cargando las piezas"><div className="shop-section-bar">La selección de {currentEra.title}</div><div className="product-grid home-product-grid era-current-grid">{Array.from({ length: 3 }, (_, i) => <div className="product-skeleton" key={i} />)}</div></div>;
}

export default function Home() {
  return <main className="storefront-home">
    <CampaignHero />
    <EraNavigation />
    <Suspense fallback={<SelectionFallback />}><HomeSelection /></Suspense>
    <EraCollections />
    <section id="historia" className="brand-statement" aria-labelledby="brand-statement-title">
      <p>El universo {brand.name}</p>
      <h2 id="brand-statement-title">Una época nos inspira.<br />La siguiente nos espera.</h2>
      <p>Cada colección abre un capítulo distinto. Cambian las formas, los símbolos y los colores; permanece nuestra manera de mirar el arte.</p>
      <Link href="/manifiesto">Ver nuestro manifiesto</Link>
    </section>
    <section id="ayuda" className="store-help" aria-label="Información de compra">
      <details><summary>Envíos</summary><p>Los plazos y costes se mostrarán antes de confirmar tu compra.</p></details>
      <details><summary>Cambios y devoluciones</summary><p>Las condiciones definitivas se publicarán antes de abrir la tienda.</p></details>
      <details><summary>Sobre las piezas</summary><p>Consulta el material, el acabado y la disponibilidad en la ficha de cada producto.</p></details>
    </section>
  </main>;
}
