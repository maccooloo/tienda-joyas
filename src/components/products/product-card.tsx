import Image from "next/image";
import Link from "next/link";
import { BrandPlaceholder } from "@/src/components/brand/brand-placeholder";
import { formatMoney } from "@/src/lib/format";
import type { Product } from "@/src/lib/shopify/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="product-card">
      <Link href={`/productos/${product.handle}`} className="product-card-link">
        <div className="product-card-image">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 480px) calc((100vw - 60px) / 2), (max-width: 760px) calc((100vw - 10vw - 12px) / 2), (max-width: 1024px) 45vw, 25vw"
            />
          ) : <BrandPlaceholder className="product-placeholder" label={product.title} />}
          {!product.availableForSale && <span className="product-badge">Agotado</span>}
        </div>
        <div className="product-card-copy">
          <h3>{product.title}</h3>
          <span>{formatMoney(product.price)}</span>
        </div>
      </Link>
    </article>
  );
}