import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import { useDebounce } from "../hooks/useDebounce";
import {
  getProducts,
  getProductsFiltered,
  type SortOption,
} from "../services/productService";
import type { Product } from "../types";

type CatalogSort = SortOption | "nameAsc";

// Minúsculas y sin tildes, para que "camara" encuentre "cámara"
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function Home() {
  const [category, setCategory] = useState("todas");
  const [sort, setSort] = useState<CatalogSort>("recent");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<{
    key: string;
    products: Product[];
    error: string | null;
  } | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const firestoreSort: SortOption = sort === "nameAsc" ? "recent" : sort;
  const filterKey = `${category}:${firestoreSort}`;
  const loading = result?.key !== filterKey;
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
      sort: firestoreSort,
    })
      .then((products) => {
        if (active) setResult({ key: filterKey, products, error: null });
      })
      .catch((err) => {
        // Si falta un índice compuesto, acá aparece el link para crearlo
        console.error(err);
        if (active) {
          setResult({
            key: filterKey,
            products: [],
            error: "No se pudieron cargar los productos.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [category, filterKey, firestoreSort]);

  const categories = useMemo(
    () => ["todas", ...Array.from(new Set(allProducts.map((p) => p.category)))],
    [allProducts],
  );

  // La búsqueda se aplica sobre lo ya cargado, usando el valor con debounce
  const products = useMemo(() => {
    const loaded = result?.key === filterKey ? result.products : [];
    const query = normalize(debouncedSearch.trim());
    const minimum = minPrice.trim() === "" ? null : Number(minPrice);
    const maximum = maxPrice.trim() === "" ? null : Number(maxPrice);
    const filtered = loaded.filter((product) => {
      const matchesSearch =
        !query ||
        normalize(
          `${product.name} ${product.description} ${product.category}`,
        ).includes(query);
      const matchesMinimum = minimum === null || product.price >= minimum;
      const matchesMaximum = maximum === null || product.price <= maximum;
      const matchesStock = !inStockOnly || product.stock > 0;
      return matchesSearch && matchesMinimum && matchesMaximum && matchesStock;
    });

    if (sort === "nameAsc") {
      return filtered.sort((a, b) => a.name.localeCompare(b.name, "es"));
    }
    return filtered;
  }, [
    result,
    filterKey,
    debouncedSearch,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
  ]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "todas" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    inStockOnly ||
    sort !== "recent";

  const clearFilters = () => {
    setSearch("");
    setCategory("todas");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("recent");
  };

  return (
    <main className="page-main catalog-page">
      <section className="catalog-heading">
        <p className="eyebrow">TECNOLOGÍA PARA TU DÍA A DÍA</p>
        <h1>Encontrá tu próximo favorito</h1>
        <p className="catalog-intro">
          Explorá tecnología y accesorios seleccionados para vos.
        </p>
      </section>

      <section className="catalog-section" aria-labelledby="products-heading">
        <div className="catalog-section-heading">
          <div>
            <p className="eyebrow">PATAGONIX TECH</p>
            <h2 id="products-heading">Catálogo</h2>
          </div>
          {!loading && !error && (
            <p
              className="catalog-result-count"
              role="status"
              aria-live="polite"
            >
              {products.length}{" "}
              {products.length === 1 ? "producto" : "productos"}
            </p>
          )}
        </div>

        <div className="catalog-filters" aria-label="Filtros del catálogo">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos por nombre, descripción o categoría"
            className="catalog-search"
          />
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
            onChange={(e) => setSort(e.target.value as CatalogSort)}
            className="rounded-lg border p-2"
            aria-label="Ordenar productos"
          >
            <option value="recent">Más recientes</option>
            <option value="priceAsc">Precio: menor a mayor</option>
            <option value="priceDesc">Precio: mayor a menor</option>
            <option value="nameAsc">Nombre: A a Z</option>
          </select>
          <label className="price-filter">
            <span>Precio desde</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Precio mínimo"
              placeholder="$ mín."
            />
          </label>
          <label className="price-filter">
            <span>Precio hasta</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Precio máximo"
              placeholder="$ máx."
            />
          </label>
          <label className="stock-filter">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <span>Solo disponibles</span>
          </label>
          {hasFilters && (
            <button
              type="button"
              className="clear-filters"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <Spinner />
        ) : products.length === 0 && !error ? (
          <div className="catalog-empty" role="status">
            <h3>No encontramos productos</h3>
            <p>Probá cambiar la búsqueda o ajustar los filtros.</p>
            {hasFilters && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Ver todo el catálogo
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
