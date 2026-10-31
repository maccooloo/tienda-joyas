import Image from "next/image";
import Link from "next/link";
import { BrandPlaceholder } from "@/src/components/brand/brand-placeholder";
import { formatMoney } from "@/src/lib/format";
import type { Product } from "@/src/lib/shopify/types";
import { eras, eraHref } from "@/src/config/eras";
import { storefrontConfig } from "@/src/lib/shopify/config";

function isInUseImage(altText: string | null) {
  return altText !== null && /\b(in use|en uso|wearing|worn|modelo|model)\b/i.test(altText);
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const alternateImages = product.images.filter((image) => image.url !== product.featuredImage?.url);
  const inUseImage = alternateImages.find((image) => isInUseImage(image.altText));
  const alternateImage = inUseImage ?? alternateImages[0];
  const upcoming = storefrontConfig.isMockShop ? eras.find((era) => era.status === "upcoming" && era.demoProductHandles.includes(product.handle)) : undefined;
  return (
    <article className="product-card">
      <Link href={upcoming ? eraHref(upcoming) : `/productos/${product.handle}`} className="product-card-link">
        <div className="product-card-image">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              fetchPriority={priority ? "high" : undefined}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 480px) calc((100vw - 60px) / 2), (max-width: 760px) calc((100vw - 10vw - 12px) / 2), (max-width: 1024px) 45vw, 25vw"
            />
          ) : <BrandPlaceholder className="product-placeholder" label={product.title} />}
          {alternateImage && (
            <Image className={`product-alternate-image${inUseImage ? " product-in-use-image" : ""}`} src={alternateImage.url} alt="" fill
              sizes="(max-width: 760px) 45vw, 25vw" loading="lazy" />
          )}
          {!product.availableForSale && <span className="product-badge">Agotado</span>}
          <span className="product-discover">Descubrir pieza <span aria-hidden="true">↗</span></span>
        </div>
        <div className="product-card-copy">
          <h3>{product.title}</h3>
          <span>{upcoming ? `${upcoming.title} · Adelanto` : formatMoney(product.price)}</span>
        </div>
      </Link>
    </article>
  );
}
