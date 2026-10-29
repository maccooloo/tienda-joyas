const DEFAULT_API_VERSION = "2026-10";
const MOCK_SHOP_DOMAIN = "jewelry-dropship.mock.shop";

const configuredDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();

export const storefrontConfig = {
  apiVersion: process.env.SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION,
  isMockShop: !configuredDomain || !privateToken,
  privateToken,
  domain: configuredDomain && privateToken ? configuredDomain : MOCK_SHOP_DOMAIN,
};

if (!/^\d{4}-\d{2}$/.test(storefrontConfig.apiVersion)) {
  throw new Error("SHOPIFY_API_VERSION debe tener formato YYYY-MM.");
}

export function getStorefrontEndpoint() {
  const rawDomain = storefrontConfig.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const domain = new URL(`https://${rawDomain}`).hostname;
  const path = `/api/${storefrontConfig.apiVersion}/graphql.json`;

  return `https://${domain}${path}`;
}