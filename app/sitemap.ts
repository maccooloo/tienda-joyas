import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/seo";
import { getCatalogRoutes } from "@/src/lib/shopify/storefront";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const routes = await getCatalogRoutes().catch(() => ({ products: [], collections: [] }));

  return [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/manifiesto", base).toString(), changeFrequency: "monthly", priority: 0.6 },
    ...routes.collections.map((collection) => ({
      url: new URL(`/colecciones/${collection.handle}`, base).toString(),
      lastModified: collection.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...routes.products.map((product) => ({
      url: new URL(`/productos/${product.handle}`, base).toString(),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
