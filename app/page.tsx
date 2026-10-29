import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandPlaceholder } from "@/src/components/brand/brand-placeholder";
import { ProductCard } from "@/src/components/products/product-card";
import { brand } from "@/src/config/brand";
import { getFeaturedCollection } from "@/src/lib/shopify/storefront";
import type { Collection } from "@/src/lib/shopify/types";

type FeaturedCollectionPromise = Promise<Collection | null>;

async function FeaturedHeroImage({ collectionPromise }: { collectionPromise: FeaturedCollectionPromise }) {
  const collection = await collectionPromise;
  const heroImage = collection?.image ?? collection?.products[0]?.featuredImage ?? null;

  return heroImage ? (
    <Image
      src={heroImage.url}
      alt={heroImage.altText ?? "Piezas de la colección"}
      fill
      priority
      fetchPriority="high"
      loading="eager"
      sizes="(max-width: 760px) calc(100vw - 48px), 48vw"
    />
  ) : (
    <BrandPlaceholder className="hero-placeholder" label={`${brand.name}, colección ${brand.collectionLabel}`} />
  );
}

async function FeaturedCollectionLink({ collectionPromise }: { collectionPromise: FeaturedCollectionPromise }) {
  const collection = await collectionPromise;
  if (!collection) return null;

  return (
    <Link className="text-link" href={`/colecciones/${collection.handle}`}>
      Ver la colección completa <span aria-hidden="true">↗</span>
    </Link>
  );
}

async function FeaturedCollectionProducts({ collectionPromise }: { collectionPromise: FeaturedCollectionPromise }) {
  const collection = await collectionPromise;

  return collection?.products.length ? (
    <div className="product-grid product-grid-featured">
      {collection.products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  ) : (
    <p className="empty-state">La colección se está preparando. Vuelve pronto.</p>
  );
}

function FeaturedCollectionFallback() {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <article className="product-card" key={index}>
          <div className="product-card-image">
            <div className="collection-image-skeleton" />
          </div>
          <div className="product-card-copy collection-copy-skeleton">
            <span />
            <span />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Home() {
  const collectionPromise = getFeaturedCollection().catch(() => null);

  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy reveal-item">
          <div className="hero-brand-lockup">
            <span className="hero-monogram" aria-hidden="true">{brand.monogram}</span>
            <span className="hero-wordmark">{brand.wordmark}</span>
          </div>
          <p className="eyebrow">Colección {brand.collectionEdition} · {brand.collectionLabel}</p>
          <h1>{brand.tagline}</h1>
          <p className="hero-description">{brand.subtitle}</p>
          <Link className="button button-gold hero-cta" href="#coleccion">
            Descubrir la colección {brand.collectionLabel}
          </Link>
        </div>
        <div className="hero-visual image-reveal">
          <Suspense fallback={<BrandPlaceholder className="hero-placeholder" label={`${brand.name}, colección ${brand.collectionLabel}`} />}>
            <FeaturedHeroImage collectionPromise={collectionPromise} />
          </Suspense>
          <span className="hero-atmosphere" aria-hidden="true" />
          <span className="hero-index">Colección {brand.collectionEdition} · {brand.collectionLabel}</span>
        </div>
        <div className="golden-thread hero-thread" aria-hidden="true" />
      </section>

      <section id="coleccion" className="collection-section page-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Colección {brand.collectionEdition}</p>
            <h2 className="section-title">{brand.collectionLabel}</h2>
          </div>
          <Suspense fallback={null}>
            <FeaturedCollectionLink collectionPromise={collectionPromise} />
          </Suspense>
        </div>
        <Suspense fallback={<FeaturedCollectionFallback />}>
          <FeaturedCollectionProducts collectionPromise={collectionPromise} />
        </Suspense>
      </section>

      <section id="historia" className="story-section">
        <div className="story-copy reveal-item">
          <p className="eyebrow">El nombre</p>
          <h2>{brand.storyHeading}</h2>
          <p>{brand.storyText}</p>
          <Link className="story-link" href="#coleccion">Descubrir las piezas</Link>
        </div>
        <figure className="story-aside story-art">
          <Image
            className="story-art-image"
            src="/images/claude-lorrain-ulysses-returns-chryseis.jpg"
            alt="Ulises conduce a Criseida de regreso con su padre en un paisaje clásico"
            fill
            sizes="(max-width: 760px) calc(100vw - 48px), 30vw"
          />
          <figcaption className="story-art-caption">
            <span className="story-art-title">Ulises devuelve a Criseida a su padre</span>
            <span className="story-art-credit">
              Claude Lorrain ·{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Claude_Lorrain_-_Ulysses_Returns_Chryseis_to_her_Father_-_WGA04992.jpg"
                target="_blank"
                rel="noreferrer"
              >
                Ver obra en Wikimedia Commons <span aria-hidden="true">↗</span>
              </a>
            </span>
          </figcaption>
        </figure>
        <div className="golden-thread story-thread" aria-hidden="true" />
      </section>

      <section className="trust-section page-shell" aria-labelledby="trust-title">
        <div className="trust-intro">
          <p className="eyebrow">Una experiencia cuidada</p>
          <h2 id="trust-title" className="section-title">Los detalles también importan.</h2>
        </div>
        <div className="trust-item">
          <h3>Envíos</h3>
          <p>Los plazos y costes se mostrarán con claridad antes de confirmar tu compra.</p>
        </div>
        <div className="trust-item">
          <h3>Cambios y devoluciones</h3>
          <p>Las condiciones definitivas se publicarán antes de abrir la tienda.</p>
        </div>
      </section>
    </main>
  );
}
