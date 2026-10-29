import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { CampaignHero } from "@/src/components/home/campaign-hero";
import { ProductCard } from "@/src/components/products/product-card";
import { brand } from "@/src/config/brand";
import { getHomeCollections } from "@/src/lib/shopify/storefront";
import { storefrontConfig } from "@/src/lib/shopify/config";
import type { Collection } from "@/src/lib/shopify/types";
import { collectionEditorial } from "@/src/lib/editorial";

type CollectionsPromise = Promise<Collection[]>;

async function HomeSelection({ collectionsPromise }: { collectionsPromise: CollectionsPromise }) {
  const collections = await collectionsPromise;
  const products = [...new Map(collections.flatMap((collection) => collection.products).map((product) => [product.id, product])).values()].slice(0, 8);
  return (
    <section id="coleccion" className="shop-selection" aria-labelledby="selection-title">
      <div className="shop-section-bar"><h2 id="selection-title">La selección</h2><Link href="#colecciones">Ver colecciones</Link></div>
      {products.length ? <div className="product-grid home-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        : <p className="empty-state">No hemos podido cargar las piezas. <Link href="/">Volver a intentarlo</Link></p>}
    </section>
  );
}

async function CollectionTiles({ collectionsPromise }: { collectionsPromise: CollectionsPromise }) {
  const collections = await collectionsPromise;
  return (
    <section id="colecciones" className="collection-tiles" aria-label="Explorar las colecciones">
      {collections.slice(0, 4).map((collection) => {
        const editorial = storefrontConfig.isMockShop ? collectionEditorial[collection.handle] : undefined;
        const image = editorial?.image ?? collection.image?.url ?? collection.products[0]?.featuredImage?.url;
        if (!image) return null;
        return (
          <Link className="collection-tile" key={collection.id} href={`/colecciones/${collection.handle}`}>
            <Image src={image} alt={editorial?.alt ?? collection.title} fill sizes="(max-width: 760px) 100vw, 50vw" />
            <div className="collection-tile-caption"><h2>{editorial?.title ?? collection.title}</h2><span>Explorar la colección</span></div>
          </Link>
        );
      })}
    </section>
  );
}

function SelectionFallback() {
  return <div className="selection-loading" aria-label="Cargando las piezas"><div className="shop-section-bar">La selección</div><div className="product-grid home-product-grid">{Array.from({ length: 8 }, (_, i) => <div className="product-skeleton" key={i} />)}</div></div>;
}

export default function Home() {
  const collectionsPromise = getHomeCollections().catch(() => []);
  return (
    <main className="storefront-home">
      <CampaignHero />
      <Suspense fallback={<SelectionFallback />}><HomeSelection collectionsPromise={collectionsPromise} /></Suspense>
      <Suspense fallback={null}><CollectionTiles collectionsPromise={collectionsPromise} /></Suspense>
      <section id="historia" className="brand-statement" aria-labelledby="brand-statement-title">
        <p>El universo {brand.name}</p>
        <h2 id="brand-statement-title">Otra época.<br />Tu propia historia.</h2>
        <p>Un gesto en un cuadro. La curva de una joya. Nos gusta mirar el pasado y encontrar algo que llevar hoy.</p>
        <Link href="/manifiesto">Ver nuestro manifiesto</Link>
      </section>
      <section id="ayuda" className="store-help" aria-label="Información de compra">
        <details><summary>Envíos</summary><p>Los plazos y costes se mostrarán antes de confirmar tu compra.</p></details>
        <details><summary>Cambios y devoluciones</summary><p>Las condiciones definitivas se publicarán antes de abrir la tienda.</p></details>
        <details><summary>Sobre las piezas</summary><p>Consulta el material, el acabado y la disponibilidad en la ficha de cada producto.</p></details>
      </section>
    </main>
  );
}
