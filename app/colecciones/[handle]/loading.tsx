export default function CollectionLoading() {
  return (
    <main className="page-shell collection-page" aria-busy="true" aria-label="Cargando colección">
      <div className="loading-heading" />
      <div className="product-grid">
        {Array.from({ length: 8 }, (_, index) => <div className="product-skeleton" key={index} />)}
      </div>
    </main>
  );
}