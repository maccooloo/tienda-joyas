export type Era = {
  slug: string;
  chapter: string;
  title: string;
  status: "current" | "upcoming";
  collectionHandle: string;
  image: string;
  imageAlt: string;
  headline: string;
  introduction: string;
  inspiration: string;
};

// Chapters follow the brand's release order, not historical chronology.
// To launch a chapter, connect its Shopify collection and change its status.
export const eras: Era[] = [
  {
    slug: "grecia", chapter: "I", title: "Grecia", status: "current", collectionHandle: "grecia",
    image: "/images/eras/grecia.webp",
    imageAlt: "Composición artística de un busto inspirado en Grecia con un collar y un pendiente dorados",
    headline: "Grecia. El comienzo.",
    introduction: "Nuestro primer capítulo nace de una mirada a Grecia: la calma de la escultura, los pliegues del mármol y la luz sobre una forma sencilla.",
    inspiration: "Nos inspiran las curvas, el equilibrio y los pequeños detalles que invitan a mirar más despacio. Así empieza nuestro recorrido entre arte y joyas.",
  },
  {
    slug: "egipto", chapter: "II", title: "Egipto", status: "upcoming", collectionHandle: "egipto",
    image: "/images/eras/egipto.webp",
    imageAlt: "Composición artística de una escultura de inspiración egipcia en piedra cálida",
    headline: "Egipto. La luz y el símbolo.",
    introduction: "El próximo destino de nuestra mirada: Egipto. Piedra cálida, siluetas serenas y una fascinación por las formas que guardan un significado.",
    inspiration: "Este adelanto reúne el ambiente que queremos explorar. Las piezas de este capítulo están por llegar.",
  },
  {
    slug: "roma", chapter: "III", title: "Roma", status: "upcoming", collectionHandle: "roma",
    image: "/images/eras/roma.webp",
    imageAlt: "Composición artística de un busto de inspiración romana con cabello esculpido y paños de mármol",
    headline: "Roma. La huella del tiempo.",
    introduction: "Después, Roma. Una mirada a los retratos, al relieve y a la presencia de los objetos que parecen guardar una historia.",
    inspiration: "Un capítulo que imaginamos entre el mármol y los reflejos del metal. Su colección se descubrirá más adelante.",
  },
  {
    slug: "renacimiento", chapter: "IV", title: "Renacimiento", status: "upcoming", collectionHandle: "renacimiento",
    image: "/images/art-botticelli.webp",
    imageAlt: "Retrato del taller de Botticelli reinterpretado con joyas contemporáneas",
    headline: "Renacimiento. Una nueva mirada.",
    introduction: "El recorrido continúa entre retratos, tejidos y gestos delicados. Los cuadros se convierten en el lugar donde imaginar una nueva colección.",
    inspiration: "La reinterpretación del retrato del taller de Botticelli anticipa este universo. Las joyas de la campaña ilustran la idea; la colección de este capítulo aún no está disponible.",
  },
];

export const currentEra = eras.find((era) => era.status === "current") ?? eras[0];
export const eraHref = (era: Era) => `/epocas/${era.slug}`;
