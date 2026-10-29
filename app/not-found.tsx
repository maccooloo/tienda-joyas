import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found page-shell">
      <p className="eyebrow">404 · Página no encontrada</p>
      <h1 className="page-title">Esta pieza no aparece en el catálogo.</h1>
      <Link className="button button-dark" href="/">Volver al inicio</Link>
    </main>
  );
}