import Image from "next/image";
import Link from "next/link";
import { eras, eraHref } from "@/src/config/eras";

export function EraNavigation() {
  return <nav className="era-navigation" aria-label="Nuestro recorrido por épocas">
    {eras.map((era) => <Link href={eraHref(era)} key={era.slug} className={era.status === "current" ? "era-current" : ""}>
      <span className="era-chapter">{era.chapter}</span><span className="era-nav-name">{era.title}</span>
      <span className="era-nav-status">{era.status === "current" ? "El primer capítulo" : "Por venir"}</span>
    </Link>)}
  </nav>;
}

export function EraCollections() {
  return <section id="colecciones" className="era-collections" aria-labelledby="era-collections-title">
    <div className="era-collections-heading"><h2 id="era-collections-title">Cada época, un nuevo capítulo.</h2><p>Empezamos en Grecia. Después miraremos hacia Egipto, Roma y el Renacimiento. El viaje seguirá creciendo.</p></div>
    <div className="collection-tiles">
      {eras.map((era) => <Link className={`collection-tile era-tile era-tile-${era.slug}`} key={era.slug} href={eraHref(era)}>
        <Image src={era.image} alt={era.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" />
        <div className="collection-tile-caption"><p className="era-tile-status">Capítulo {era.chapter} / {era.status === "current" ? "La colección actual" : "Por venir"}</p><h3>{era.title}</h3><span>{era.status === "current" ? "Descubrir las piezas" : "Explorar el universo"}</span></div>
      </Link>)}
    </div>
  </section>;
}
