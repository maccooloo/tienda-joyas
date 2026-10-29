export const collectionEditorial: Record<string, { title: string; image: string; alt: string }> = {
  "radiant-layering-essentials": {
    title: "Collares y pendientes",
    image: "/images/art-botticelli.webp",
    alt: "Retrato renacentista reinterpretado con un collar de eslabones y un pendiente dorado",
  },
  "enchanted-stacking-sets": {
    title: "Anillos y pulseras",
    image: "/images/art-ingres.webp",
    alt: "Madame Moitessier reinterpretada con anillos del catálogo",
  },
};

export type NavigationCollection = { href: string; title: string; image: string | null };

export const demoProductTitles: Record<string, string> = {
  "gold-plated-cuban-link-chain-necklace": "Cadena de eslabones",
  "collar-de-cadena-bano-de-oro": "Collar de eslabones ovalados",
  "large-waterproof-gold-plated-hoop-earrings": "Aros con relieve",
  "gilded-gold-statement-hoop-earrings": "Aros trenzados",
  "radiance-stackable-rings-set-brushed-gold": "Anillos apilables",
  "semi-precious-stone-ring": "Anillo floral",
  "pulseira-de-charms-banhada-a-ouro": "Pulsera de charms",
};

// These edited packshots belong to the demonstration catalogue only.
export const demoPackshots: Record<string, string> = Object.fromEntries([
  "gold-plated-cuban-link-chain-necklace",
  "collar-de-cadena-bano-de-oro",
  "large-waterproof-gold-plated-hoop-earrings",
  "gilded-gold-statement-hoop-earrings",
  "radiance-stackable-rings-set-brushed-gold",
  "semi-precious-stone-ring",
  "pulseira-de-charms-banhada-a-ouro",
].map((handle) => [handle, `/images/products/${handle}.webp`]));
