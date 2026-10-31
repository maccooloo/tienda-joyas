export const catalogCategories = [
  { slug: "collares", title: "Collares", pattern: /collar|necklace|chain|colar/i },
  { slug: "pendientes", title: "Pendientes", pattern: /pendiente|earring|aro|brinco/i },
  { slug: "pulseras", title: "Pulseras", pattern: /pulsera|bracelet|pulseira/i },
  { slug: "anillos", title: "Anillos", pattern: /anillo|\bring\b|rings|anel/i },
] as const;

export function catalogCategory(product: { title: string; handle: string }) {
  const text = `${product.title} ${product.handle.replaceAll("-", " ")}`;
  return catalogCategories.find((category) => category.pattern.test(text))?.slug;
}
