import { currentEra } from "@/src/config/eras";
import { getEraProducts } from "@/src/lib/era-products";

export async function GET() {
  try {
    const products = (await getEraProducts(currentEra))
      .filter((product) => product.availableForSale && product.variants.some((variant) => variant.availableForSale))
      .slice(0, 8)
      .map(({ id, handle, title, featuredImage, variants }) => ({ id, handle, title, featuredImage, variants }));
    return Response.json({ products }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return Response.json({ products: [] }, { status: 503 });
  }
}
