import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CampaignHero } from "@/src/components/home/campaign-hero";
import { brand } from "@/src/config/brand";

export const metadata: Metadata = { title: "Manifiesto", description: "El universo de Criseida: una mirada al arte, al tiempo y a las joyas que hacemos nuestras." };

export default function Manifesto() {
  return <main className="manifesto-page">
    <CampaignHero manifesto />
    <section id="manifiesto" className="manifesto-intro">
      <p>Nuestra manera de mirar</p>
      <h2>Hay cosas que<br />no pertenecen a una época.</h2>
      <div><p>Una mirada. Una mano que descansa. Un pequeño destello entre los pliegues de un vestido.</p>
        <p>En {brand.name} nos inspira esa belleza que permanece. La que encuentras en un cuadro antiguo y reconoces, sin saber por qué, como algo tuyo.</p>
        <p>Acercamos esos dos mundos: el arte que contemplas y las joyas que te acompañan. Para dar al pasado una vida nueva, contigo.</p></div>
    </section>
    <section className="manifesto-diptych" aria-labelledby="manifesto-detail-title">
      <div className="manifesto-portrait"><Image src="/images/art-ingres.webp" alt="Reinterpretación de Madame Moitessier con un anillo floral junto al rostro y anillos apilados en la mano" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
      <div className="manifesto-detail"><p>El detalle cambia la mirada</p><h2 id="manifesto-detail-title">De un lienzo<br />a tu piel.</h2><p>Revisitamos retratos antiguos con piezas de nuestra selección. Un encuentro entre lo que fue y lo que tú quieras hacer con ello.</p><Link href="/#coleccion">Encontrar tu pieza</Link></div>
    </section>
    <details className="art-credits"><summary>Las obras que nos inspiran</summary>
      <p>Campaña digital reinterpretada con IA a partir de obras de dominio público. El vídeo es un montaje animado de estas imágenes.</p>
      <p><a href="https://commons.wikimedia.org/wiki/File:Botticelli_-_Portrait_of_a_Young_Woman,_probably_Simonetta_Vespucci.jpg" target="_blank" rel="noreferrer">Taller de Sandro Botticelli, retrato de perfil de una joven</a>. <a href="https://commons.wikimedia.org/wiki/File:Madame_Moitessier_by_Jean-Auguste-Dominique_Ingres.jpg" target="_blank" rel="noreferrer">Jean-Auguste-Dominique Ingres, Madame Moitessier (1856)</a>. Versiones adaptadas para la campaña de {brand.name}.</p>
    </details>
  </main>;
}
