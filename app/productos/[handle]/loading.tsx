export default function ProductLoading() {
  return (
    <main className="page-shell product-page" aria-busy="true" aria-label="Cargando producto">
      <div className="product-loading-media" />
      <div className="product-loading-copy" />
    </main>
  );
}