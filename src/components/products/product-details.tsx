import Image from "next/image";
import Link from "next/link";
import { BrandPlaceholder } from "@/src/components/brand/brand-placeholder";
import { brand } from "@/src/config/brand";
import { ProductPurchasePanel } from "@/src/components/products/product-purchase-panel";
import { ProductViewer3D } from "@/src/components/products/product-viewer-3d";
import { formatMoney } from "@/src/lib/format";
import { storefrontConfig } from "@/src/lib/shopify/config";
import type { Product } from "@/src/lib/shopify/types";
import { eras, eraHref } from "@/src/config/eras";

export function ProductDetails({ product }: { product: Product }) {
  const era = storefrontConfig.isMockShop ? eras.find((entry) => entry.demoProductHandles.includes(product.handle)) : undefined;
  const upcoming = era?.status === "upcoming";
  const images = product.images.length > 0
    ? product.images
    : product.featuredImage ? [product.featuredImage] : [];
  const model = storefrontConfig.isMockShop ? undefined : product.media.find((media) => media.type === "model3d");

  return (
    <main className="page-shell product-page">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link><span aria-hidden="true">/</span><span>{product.title}</span>
      </nav>
      <div className="product-layout">
        <div className="product-gallery" aria-label={`Imágenes de ${product.title}`}>
          {images.length > 0 ? images.map((image, index) => (
            <div className={`gallery-image ${index === 0 ? "gallery-image-primary" : ""}`} key={`${image.url}-${index}`}>
              <Image
                src={image.url}
                alt={image.altText ?? `${product.title}, vista ${index + 1}`}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes={index === 0 ? "(max-width: 900px) 100vw, 58vw" : "(max-width: 900px) 50vw, 29vw"}
              />
            </div>
          )) : !model ? (
            <BrandPlaceholder className="gallery-image gallery-image-primary product-placeholder" label={product.title} />
          ) : null}
          {model?.type === "model3d" && model.sources[0] && (
            <ProductViewer3D src={model.sources[0].url} title={product.title} />
          )}
        </div>

        <section className="product-information" aria-labelledby="product-title">
          <p className="eyebrow">{era ? <Link href={eraHref(era)}>{era.title}</Link> : brand.name} · {upcoming ? "Adelanto de colección" : product.availableForSale ? "Pieza de colección" : "No disponible"}</p>
          <h1 id="product-title" className="product-title">{product.title}</h1>
          {!upcoming && <p className="product-price">{formatMoney(product.price)}</p>}
          <div className="product-story">
            <p className="eyebrow">El relato</p>
            <p className="product-description">{product.description}</p>
          </div>
          {upcoming && era ? <div className="era-product-notice"><p>Esta pieza forma parte de la selección propuesta para {era.title}. El capítulo todavía no está disponible.</p><Link href={eraHref(era)}>Explorar el adelanto</Link></div> : <ProductPurchasePanel product={product} />}
          <div className="product-facts">
            <p className="eyebrow">Detalles de la pieza</p>
            <p>Material, acabado, medidas y cuidados: información por confirmar con el proveedor.</p>
          </div>
          <div className="product-assurances">
            <div><span aria-hidden="true">·</span><p>Envío y plazos por confirmar antes del lanzamiento.</p></div>
            <div><span aria-hidden="true">·</span><p>Política de cambios y devoluciones pendiente de definir.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
