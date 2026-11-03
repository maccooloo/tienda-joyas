import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/src/components/products/product-card";
import { catalogCategories, catalogCategory } from "@/src/config/catalog";
import { getAvailableCatalog } from "@/src/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Todas las piezas",
  description: "Descubre todas las joyas disponibles: collares, pendientes, pulseras y anillos.",
  alternates: { canonical: "/shop" },
};

async function Catalog({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  const [query, products] = await Promise.all([searchParams, getAvailableCatalog().catch(() => null)]);
  const category = catalogCategories.find((entry) => entry.slug === query.tipo);
  const selected = products?.filter((product) => !category || catalogCategory(product) === category.slug) ?? [];
  return <>
    <nav className="catalog-filters" aria-label="Tipo de joya">
      <Link href="/shop" aria-current={!category ? "page" : undefined}>Todas las piezas</Link>
      {catalogCategories.map((entry) => <Link key={entry.slug} href={`/shop?tipo=${entry.slug}`} aria-current={entry === category ? "page" : undefined}>{entry.title}</Link>)}
    </nav>
    {products === null ? <p className="empty-state">No hemos podido cargar las piezas. <Link href="/shop">Volver a intentarlo</Link></p>
      : <>
        <p className="catalog-count" aria-live="polite">{selected.length} {selected.length === 1 ? "pieza disponible" : "piezas disponibles"}</p>
        {selected.length ? <div className="product-grid catalog-grid">{selected.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 4} />)}</div>
          : <div className="catalog-empty"><p>Pronto habrá nuevas piezas en esta selección.</p><Link href="/shop">Ver todas las piezas disponibles</Link></div>}
      </>}
  </>;
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return <main className="catalog-page">
    <div className="catalog-intro"><h1>Todas las piezas</h1><p>Joyas para llevar contigo.</p></div>
    <Suspense fallback={<p className="empty-state">Cargando las piezas…</p>}><Catalog searchParams={searchParams} /></Suspense>
  </main>;
}
