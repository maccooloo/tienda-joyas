import "server-only";
import { getCollection, getHomeCollections } from "@/src/lib/shopify/storefront";
import { storefrontConfig } from "@/src/lib/shopify/config";
import type { Era } from "@/src/config/eras";

export async function getEraProducts(era: Era) {
  if (era.status !== "current") return [];
  if (storefrontConfig.isMockShop) {
    const collections = await getHomeCollections();
    return [...new Map(collections.flatMap((collection) => collection.products).map((product) => [product.id, product])).values()];
  }
  const collection = await getCollection(era.collectionHandle);
  return collection?.products ?? [];
}
