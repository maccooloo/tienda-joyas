import type { Cart, CartLine, Collection, Product, ProductMedia, ProductVariant, ShopifyImage } from "@/src/lib/shopify/types";
import { storefrontConfig } from "@/src/lib/shopify/config";
import { collectionEditorial, demoPackshots, demoProductTitles } from "@/src/lib/editorial";

type RawImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type RawMoney = { amount: string; currencyCode: string };

type RawVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: RawMoney;
  selectedOptions?: Array<{ name: string; value: string }>;
  image?: RawImage | null;
};

type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  availableForSale: boolean;
  priceRange: { minVariantPrice: RawMoney };
  featuredImage?: RawImage | null;
  images?: { nodes: RawImage[] };
  variants?: { nodes: RawVariant[] };
  media?: { nodes: Array<Record<string, unknown>> };
};

type RawCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: RawImage | null;
  products: { nodes: RawProduct[] };
};

function mapImage(image?: RawImage | null): ShopifyImage | null {
  if (!image?.url) return null;
  return {
    url: image.url,
    altText: image.altText ?? null,
    width: image.width ?? 1200,
    height: image.height ?? 1200,
  };
}

export function mapProduct(raw: RawProduct): Product {
  const title = storefrontConfig.isMockShop ? demoProductTitles[raw.handle] ?? raw.title : raw.title;
  const packshot = demoImage(raw.handle, title);
  const variants: ProductVariant[] = (raw.variants?.nodes ?? []).map((variant) => ({
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable ?? null,
    price: variant.price,
    selectedOptions: variant.selectedOptions ?? [],
    image: packshot ?? mapImage(variant.image),
  }));

  const media = (raw.media?.nodes ?? []).flatMap<ProductMedia>((node) => {
    if (node.__typename === "Model3d") {
      const sources = node.sources as Array<{ url: string; mimeType: string }> | undefined;
      return sources?.length ? [{ type: "model3d", sources }] : [];
    }

    if (node.__typename === "MediaImage") {
      const image = mapImage(node.image as RawImage | undefined);
      return image ? [{ type: "image", image }] : [];
    }

    return [];
  });

  return {
    id: raw.id,
    handle: raw.handle,
    title,
    description: raw.description ?? "",
    availableForSale: raw.availableForSale,
    price: raw.priceRange.minVariantPrice,
    featuredImage: packshot ?? mapImage(raw.featuredImage),
    images: packshot ? [packshot] : (raw.images?.nodes ?? []).flatMap((image) => {
      const mapped = mapImage(image);
      return mapped ? [mapped] : [];
    }),
    variants,
    media: packshot ? [{ type: "image", image: packshot }, ...media.filter((item) => item.type === "model3d")] : media,
  };
}

export function mapCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: storefrontConfig.isMockShop ? collectionEditorial[raw.handle]?.title ?? raw.title : raw.title,
    description: raw.description ?? "",
    image: mapImage(raw.image),
    products: raw.products.nodes.filter((product) => !storefrontConfig.isMockShop || !product.handle.includes("watch")).map(mapProduct),
  };
}

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        product: { title: string; handle?: string };
        image?: RawImage | null;
        price: RawMoney;
      };
      cost: { totalAmount: RawMoney };
    }>;
  };
};

export function mapCart(raw: RawCart): Cart {
  const lines: CartLine[] = raw.lines.nodes.map((line) => ({
    id: line.id,
    quantity: line.quantity,
    merchandiseId: line.merchandise.id,
    title: storefrontConfig.isMockShop ? demoProductTitles[line.merchandise.product.handle ?? ""] ?? line.merchandise.product.title : line.merchandise.product.title,
    variantTitle: line.merchandise.title,
    image: demoImage(line.merchandise.product.handle, line.merchandise.product.title) ?? mapImage(line.merchandise.image),
    unitPrice: line.merchandise.price,
    totalPrice: line.cost.totalAmount,
  }));

  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: raw.cost.subtotalAmount,
    lines,
  };
}

export type { RawCollection, RawProduct, RawCart };

function demoImage(handle: string | undefined, title: string): ShopifyImage | null {
  const url = storefrontConfig.isMockShop && handle ? demoPackshots[handle] : undefined;
  return url ? { url, altText: title, width: 1000, height: 1000 } : null;
}
