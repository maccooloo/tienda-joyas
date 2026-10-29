import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/products/product-card";
import { getCollection } from "@/src/lib/shopify/storefront";
import type { ProductSortKey } from "@/src/lib/shopify/types";

const sortOptions = ["BEST_SELLING", "TITLE", "PRICE", "CREATED"] as const;

function parseSort(value?: string | string[]): ProductSortKey {
  const sort = Array.isArray(value) ? value[0] : value;
  return sortOptions.includes(sort as ProductSortKey) ? sort as ProductSortKey : "BEST_SELLING";
}

export async function generateMetadata({ params }: PageProps<"/colecciones/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle).catch(() => null);
  if (!collection) return { title: "Colección no encontrada" };

  return {
    title: collection.title,
    description: collection.description || `Descubre la colección ${collection.title}.`,
    alternates: { canonical: `/colecciones/${collection.handle}` },
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: collection.image ? [collection.image.url] : [],
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/colecciones/[handle]">) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const sort = parseSort(query.orden);
  const collection = await getCollection(handle, sort).catch(() => null);
  if (!collection) notFound();

  return (
    <main className="page-shell collection-page">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/#coleccion">Colecciones</Link><span aria-hidden="true">/</span><span>{collection.title}</span>
      </nav>
      <div className="collection-title-row">
        <div>
          <p className="eyebrow">Colección</p>
          <h1 className="page-title">{collection.title}</h1>
          {collection.description && <p className="collection-description">{collection.description}</p>}
        </div>
        <form className="sort-form" method="get">
          <label htmlFor="collection-sort">Ordenar por</label>
          <select id="collection-sort" name="orden" defaultValue={sort} className="select-field">
            <option value="BEST_SELLING">Relevancia</option>
            <option value="TITLE">Nombre</option>
            <option value="PRICE">Precio</option>
            <option value="CREATED">Novedades</option>
          </select>
          <button className="sort-submit" type="submit">Aplicar</button>
        </form>
      </div>
      {collection.products.length ? (
        <div className="product-grid">
          {collection.products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      ) : (
        <p className="empty-state">Esta colección todavía no tiene productos disponibles.</p>
      )}
    </main>
  );
}