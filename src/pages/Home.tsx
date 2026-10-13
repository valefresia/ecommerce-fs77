import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import {
  getProducts,
  getProductsFiltered,
  type SortOption,
} from "../services/productService";
import type { Product } from "../types";

export default function Home() {
  const [category, setCategory] = useState("todas");
  const [sort, setSort] = useState<SortOption>("recent");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<{
    key: string;
    products: Product[];
    error: string | null;
  } | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const filterKey = `${category}:${sort}`;
  const loading = result?.key !== filterKey;
  const products = result?.key === filterKey ? result.products : [];
  const error =
    categoryError || (result?.key === filterKey ? (result.error ?? "") : "");

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .catch((err) => {
        console.error(err);
        setCategoryError("No se pudieron cargar las categorías.");
      });
  }, []);

  useEffect(() => {
    let active = true;
    getProductsFiltered({
      category: category === "todas" ? undefined : category,
      sort,
    })
      .then((products) => {
        if (active)
          setResult({ key: `${category}:${sort}`, products, error: null });
      })
      .catch((err) => {
        // Si falta un índice compuesto, acá aparece el link para crearlo
        console.error(err);
        if (active) {
          setResult({
            key: `${category}:${sort}`,
            products: [],
            error: "No se pudieron cargar los productos.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [category, sort]);

  const categories = useMemo(
    () => ["todas", ...Array.from(new Set(allProducts.map((p) => p.category)))],
    [allProducts],
  );

  return (
    <main className="page-main home-page flex flex-col gap-6">
      <section className="catalog-section flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="catalog-heading">
            <span className="eyebrow">CATÁLOGO</span>
            <h1 className="text-2xl font-bold">Productos</h1>
          </div>
          <div className="catalog-filters flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border p-2"
              aria-label="Filtrar por categoría"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "todas" ? "Todas las categorías" : c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border p-2"
              aria-label="Ordenar productos"
            >
              <option value="recent">Más recientes</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <Spinner />
        ) : products.length === 0 && !error ? (
          <p>No hay productos para mostrar.</p>
        ) : (
          <div className="product-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
