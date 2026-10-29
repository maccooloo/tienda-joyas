import { getHomeCollections } from "@/src/lib/shopify/storefront";

export async function GET() {
  try {
    const collections = await getHomeCollections();
    const products = [...new Map(collections.flatMap((collection) => collection.products).map((product) => [product.id, product])).values()]
      .filter((product) => product.availableForSale && product.variants.some((variant) => variant.availableForSale))
      .slice(0, 8)
      .map(({ id, handle, title, featuredImage, variants }) => ({ id, handle, title, featuredImage, variants }));
    return Response.json({ products }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return Response.json({ products: [] }, { status: 503 });
  }
}
