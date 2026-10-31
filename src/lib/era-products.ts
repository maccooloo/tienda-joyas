import "server-only";
import { getCollection, getHomeCollections } from "@/src/lib/shopify/storefront";
import { storefrontConfig } from "@/src/lib/shopify/config";
import type { Era } from "@/src/config/eras";

export async function getEraProducts(era: Era) {
  if (storefrontConfig.isMockShop) {
    const collections = await getHomeCollections();
    const products = collections.flatMap((collection) => collection.products);
    return era.demoProductHandles.flatMap((handle) => {
      const product = products.find((entry) => entry.handle === handle);
      return product ? [product] : [];
    });
  }
  const collection = await getCollection(era.collectionHandle);
  return collection?.products ?? [];
}
