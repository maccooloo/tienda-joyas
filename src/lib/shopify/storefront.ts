import "server-only";

import { shopifyFetch } from "@/src/lib/shopify/client";
import { mapCart, mapCollection, mapProduct, type RawCart, type RawCollection, type RawProduct } from "@/src/lib/shopify/mappers";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  CATALOG_QUERY,
  COLLECTION_QUERY,
  FEATURED_COLLECTION_QUERY,
  HOME_COLLECTIONS_QUERY,
  PRODUCT_QUERY,
  SITEMAP_QUERY,
} from "@/src/lib/shopify/queries";
import type { Cart, Collection, Product, ProductSortKey } from "@/src/lib/shopify/types";
import { storefrontConfig } from "@/src/lib/shopify/config";
import { eras } from "@/src/config/eras";

export async function getAvailableCatalog(): Promise<Product[]> {
  type CatalogPage = { products: { nodes: RawProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };
  const products = new Map<string, Product>();
  const upcoming = new Set(eras.filter((era) => era.status === "upcoming").flatMap((era) => era.demoProductHandles));
  let cursor: string | null = null;
  do {
    const page: CatalogPage = await shopifyFetch<CatalogPage>(CATALOG_QUERY, { cursor });
    for (const raw of page.products.nodes) {
      if (!raw.availableForSale) continue;
      if (storefrontConfig.isMockShop && (upcoming.has(raw.handle) || raw.handle.includes("watch"))) continue;
      products.set(raw.id, mapProduct(raw));
    }
    const nextCursor = page.products.pageInfo.endCursor;
    if (!page.products.pageInfo.hasNextPage || !nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
  } while (cursor);
  return [...products.values()];
}

export async function getFeaturedCollection(): Promise<Collection | null> {
  const data = await shopifyFetch<{ collections: { nodes: RawCollection[] } }>(FEATURED_COLLECTION_QUERY);
  return data.collections.nodes[0] ? mapCollection(data.collections.nodes[0]) : null;
}

export async function getHomeCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: RawCollection[] } }>(HOME_COLLECTIONS_QUERY);
  return data.collections.nodes.map(mapCollection);
}

export async function getCollection(handle: string, sortKey: ProductSortKey = "BEST_SELLING") {
  const data = await shopifyFetch<{ collection: RawCollection | null }>(COLLECTION_QUERY, { handle, sortKey });
  return data.collection ? mapCollection(data.collection) : null;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: RawProduct | null }>(PRODUCT_QUERY, { handle });
  return data.product ? mapProduct(data.product) : null;
}

export async function getCatalogRoutes() {
  type CatalogPage = {
    products: { nodes: Array<{ handle: string; updatedAt: string }>; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
    collections: { nodes: Array<{ handle: string; updatedAt: string }>; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  };

  const products: CatalogPage["products"]["nodes"] = [];
  const collections: CatalogPage["collections"]["nodes"] = [];
  let productCursor: string | null = null;
  let collectionCursor: string | null = null;
  let hasMoreProducts = true;
  let hasMoreCollections = true;

  while (hasMoreProducts || hasMoreCollections) {
    const page: CatalogPage = await shopifyFetch<CatalogPage>(SITEMAP_QUERY, { productCursor, collectionCursor });
    products.push(...page.products.nodes);
    collections.push(...page.collections.nodes);
    hasMoreProducts = page.products.pageInfo.hasNextPage;
    hasMoreCollections = page.collections.pageInfo.hasNextPage;
    productCursor = page.products.pageInfo.endCursor;
    collectionCursor = page.collections.pageInfo.endCursor;
  }

  return { products, collections };
}

export async function getCartById(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>(CART_QUERY, { cartId }, "no-store");
  return data.cart ? mapCart(data.cart) : null;
}

type CartMutationPayload = {
  cart: Pick<RawCart, "id"> | null;
  userErrors: Array<{ message: string }>;
};

async function finishCartMutation(payload: CartMutationPayload) {
  const error = payload.userErrors[0]?.message;
  if (error) throw new Error(error);
  if (!payload.cart) throw new Error("Shopify no devolvio el carrito actualizado.");

  const cart = await getCartById(payload.cart.id);
  if (!cart) throw new Error("No se pudo recuperar el carrito actualizado.");
  return cart;
}

export async function createCart(variantId: string, quantity: number) {
  const data = await shopifyFetch<{ cartCreate: CartMutationPayload }>(
    CART_CREATE_MUTATION,
    { lines: [{ merchandiseId: variantId, quantity }] },
    "no-store",
  );
  return finishCartMutation(data.cartCreate);
}

export async function addCartLine(cartId: string, variantId: string, quantity: number) {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationPayload }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    "no-store",
  );
  return finishCartMutation(data.cartLinesAdd);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationPayload }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    "no-store",
  );
  return finishCartMutation(data.cartLinesUpdate);
}

export async function removeCartLine(cartId: string, lineId: string) {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationPayload }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
    "no-store",
  );
  return finishCartMutation(data.cartLinesRemove);
}
