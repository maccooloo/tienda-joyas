export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  selectedOptions: Array<{ name: string; value: string }>;
  image: ShopifyImage | null;
};

export type ProductMedia =
  | { type: "image"; image: ShopifyImage }
  | { type: "model3d"; sources: Array<{ url: string; mimeType: string }> };

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  price: Money;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  variants: ProductVariant[];
  media: ProductMedia[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: Product[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  variantTitle: string;
  image: ShopifyImage | null;
  unitPrice: Money;
  totalPrice: Money;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};

export type ProductSortKey = "BEST_SELLING" | "TITLE" | "PRICE" | "CREATED";