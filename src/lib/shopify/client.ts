import "server-only";

import { headers } from "next/headers";
import { getStorefrontEndpoint, storefrontConfig } from "@/src/lib/shopify/config";

type FetchPolicy = "catalog" | "no-store";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  policy: FetchPolicy = "catalog",
): Promise<T> {
  const requestHeaders = new Headers({ "Content-Type": "application/json" });

  if (!storefrontConfig.isMockShop && storefrontConfig.privateToken) {
    requestHeaders.set("Shopify-Storefront-Private-Token", storefrontConfig.privateToken);

    const incomingHeaders = await headers().catch(() => null);
    const buyerIp = incomingHeaders?.get("x-real-ip")
      ?? incomingHeaders?.get("x-forwarded-for")?.split(",")[0]?.trim();

    if (buyerIp) requestHeaders.set("Shopify-Storefront-Buyer-IP", buyerIp);
  }

  const response = await fetch(getStorefrontEndpoint(), {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({ query, variables }),
    ...(policy === "catalog"
      ? { next: { revalidate: 300, tags: ["shopify-catalog"] } }
      : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API respondio con ${response.status}.`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }

  if (!result.data) throw new Error("Shopify Storefront API no devolvio datos.");
  return result.data;
}