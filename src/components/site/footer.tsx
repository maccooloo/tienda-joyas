import Link from "next/link";
import { brand } from "@/src/config/brand";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-top">
      <p className="footer-tagline">{brand.tagline}</p>
      <nav className="footer-nav" aria-label="Navegación del pie">
        <Link href="/shop">Todas las piezas</Link>
        <Link href="/#colecciones">Colecciones</Link>
        <Link href="/manifiesto">La marca</Link>
        <Link href="/#ayuda">Ayuda y cuidados</Link>
      </nav>
    </div>
    <Link href="/" className="footer-brand" aria-label={`${brand.name}, inicio`}>{brand.wordmark}</Link>
    <div className="footer-bottom"><span>© {brand.name}</span><span>Español</span><Link href="/manifiesto#creditos">Arte y créditos</Link></div>
  </footer>;
}
