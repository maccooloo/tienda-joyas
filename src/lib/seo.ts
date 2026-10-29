export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function getSiteUrl() {
  return new URL(process.env.SITE_URL ?? "http://localhost:3000");
}