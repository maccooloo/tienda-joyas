import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentEra, eras, eraHref, type Era } from "@/src/config/eras";
import { EraNavigation } from "@/src/components/home/era-collections";
import { ProductCard } from "@/src/components/products/product-card";
import { getEraProducts } from "@/src/lib/era-products";

export function generateStaticParams() { return eras.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: PageProps<"/epocas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const era = eras.find((entry) => entry.slug === slug);
  return era ? { title: era.title, description: era.introduction, alternates: { canonical: eraHref(era) }, openGraph: { images: [{ url: era.image, alt: era.imageAlt }] } } : { title: "Época no encontrada" };
}

async function EraSelection({ era }: { era: Era }) {
    const products = await getEraProducts(era).catch(() => null);
    if (!products) return <p className="empty-state">No hemos podido cargar las piezas. <Link href="/#coleccion">Volver a la selección</Link></p>;
    if (era.status === "upcoming") return products.length ? <div className="era-preview-grid">{products.map((product) => <figure key={product.id} className="era-preview-piece">
      <div>{product.featuredImage && <Image src={product.featuredImage.url} alt={product.title} fill sizes="(max-width: 760px) 50vw, 450px" />}</div>
      <figcaption><h3>{product.title}</h3><p>Selección propuesta para {era.title}</p></figcaption>
    </figure>)}</div> : null;
    return products.length ? <div className="product-grid home-product-grid era-current-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      : <p className="empty-state">Estamos preparando las piezas de este capítulo. <Link href="/#colecciones">Explorar las épocas</Link></p>;
}

export default async function EraPage({ params }: PageProps<"/epocas/[slug]">) {
  const { slug } = await params;
  const era = eras.find((entry) => entry.slug === slug);
  if (!era) notFound();
  const upcoming = era.status === "upcoming";
  return <main className={`era-page era-page-${era.slug}`}>
    <section className="era-page-intro" aria-labelledby="era-page-title">
      <div className="era-page-art"><Image src={era.image} alt={era.imageAlt} fill sizes="(max-width: 760px) 100vw, 55vw" preload /></div>
      <div className="era-page-copy">
        <Link className="era-back" href="/#colecciones">Todas las épocas</Link>
        <p className="era-kicker">Capítulo {era.chapter} / {upcoming ? "Por venir" : "Nuestro comienzo"}</p>
        <h1 id="era-page-title">{era.headline}</h1>
        <p>{era.introduction}</p><p>{era.inspiration}</p>
        <Link className="era-page-link" href={upcoming ? eraHref(currentEra) : "#piezas"}>{upcoming ? `Mientras tanto, descubre ${currentEra.title}` : "Ver las piezas"}</Link>
      </div>
    </section>
    {!upcoming && <section className="shop-selection era-selection" id="piezas" aria-labelledby="era-selection-title"><div className="shop-section-bar"><h2 id="era-selection-title">Las piezas de {era.title}</h2></div><Suspense fallback={<p className="empty-state">Cargando las piezas…</p>}><EraSelection era={era} /></Suspense></section>}
    {upcoming && <section className="era-design-preview" aria-labelledby="era-design-title">
      <div className="era-collections-heading"><h2 id="era-design-title">El lenguaje de las piezas</h2><p>{era.slug === "egipto" ? "Símbolos pequeños y un acento de color." : era.slug === "roma" ? "Eslabones compactos y volúmenes trenzados." : "Formas florales, piedras de color y anillos que se combinan."} Un adelanto de diseño, todavía no disponible como colección.</p></div>
      {era.designStudy ? <figure className="era-design-study"><div><Image src={era.designStudy.image} alt={era.designStudy.alt} fill sizes="(max-width: 760px) 100vw, 900px" /></div><figcaption><h3>{era.designStudy.title}</h3><p>{era.designStudy.description}</p></figcaption></figure>
        : <Suspense fallback={<p className="empty-state">Cargando el adelanto…</p>}><EraSelection era={era} /></Suspense>}
    </section>}
    <EraNavigation />
    <p className="era-image-note">{era.slug === "renacimiento" ? "Retrato reinterpretado a partir de una obra del taller de Botticelli." : "Escena artística imaginada para la campaña."} <Link href="/manifiesto">Nuestro universo</Link></p>
  </main>;
}
