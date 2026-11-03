import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/src/components/products/product-details";
import { brand } from "@/src/config/brand";
import { safeJsonLd } from "@/src/lib/seo";
import { getProduct } from "@/src/lib/shopify/storefront";
import { storefrontConfig } from "@/src/lib/shopify/config";
import { eras } from "@/src/config/eras";

export async function generateMetadata({ params }: PageProps<"/productos/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle).catch(() => null);
  if (!product) return { title: "Pieza no encontrada" };

  return {
    title: product.title,
    description: product.description || `${product.title}, una pieza de ${brand.name}.`,
    alternates: { canonical: `/productos/${product.handle}` },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.description,
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/productos/[handle]">) {
  const { handle } = await params;
  const product = await getProduct(handle).catch(() => null);
  if (!product) notFound();
  const upcoming = storefrontConfig.isMockShop && eras.some((era) => era.status === "upcoming" && era.demoProductHandles.includes(product.handle));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: brand.name },
    offers: upcoming ? undefined : product.variants.map((variant) => ({
      "@type": "Offer",
      priceCurrency: variant.price.currencyCode,
      price: variant.price.amount,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.SITE_URL ?? "http://localhost:3000"}/productos/${product.handle}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <ProductDetails product={product} />
    </>
  );
}
