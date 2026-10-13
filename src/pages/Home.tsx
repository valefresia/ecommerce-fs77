import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useDebounce } from "../hooks/useDebounce";
import { logout } from "../services/authService";
import {
  getProducts,
  getProductsFiltered,
  type SortOption,
} from "../services/productService";
import type { Product } from "../types";

// Minúsculas y sin tildes, para que "camara" encuentre "cámara"
const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function Home() {
  const { user, profile, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [category, setCategory] = useState("todas");
  const [sort, setSort] = useState<SortOption>("recent");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<{
    key: string;
    products: Product[];
    error: string | null;
  } | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const filterKey = `${category}:${sort}`;
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

  // La búsqueda se aplica sobre lo ya cargado, usando el valor con debounce
  const products = useMemo(() => {
    const loaded = result?.key === filterKey ? result.products : [];
    const query = normalize(debouncedSearch.trim());
    if (!query) return loaded;
    return loaded.filter((p) => normalize(p.name).includes(query));
  }, [result, filterKey, debouncedSearch]);

  const isSearching = debouncedSearch.trim() !== "";

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Patagonix Tech</h1>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/cart" className="text-blue-600">
            Carrito ({totalItems})
          </Link>

          {user ? (
            <>
              <span>
                Hola, {profile?.displayName} ({profile?.role})
              </span>
              <Link to="/orders" className="text-blue-600">
                Mis pedidos
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-blue-600">
                  Panel admin
                </Link>
              )}
              <button onClick={logout} className="rounded-lg border px-4 py-2">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600">
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-blue-600">
                Registrarme
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Productos</h2>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar productos por nombre"
            className="w-full rounded-lg border p-2 sm:flex-1"
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
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border p-2"
            aria-label="Ordenar productos"
          >
            <option value="recent">Más recientes</option>
            <option value="priceAsc">Precio: menor a mayor</option>
            <option value="priceDesc">Precio: mayor a menor</option>
          </select>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <Spinner />
        ) : products.length === 0 && !error ? (
          <p>
            {isSearching
              ? `No encontramos productos que coincidan con "${debouncedSearch.trim()}".`
              : "No hay productos para mostrar."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}