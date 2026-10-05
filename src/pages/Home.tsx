import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { logout } from '../services/authService';

export default function Home() {
  const { user, profile, isAdmin } = useAuth();
  const { products, loading, error } = useProducts();
  const [category, setCategory] = useState('todas');

  // Categorías únicas, sacadas de los productos cargados
  const categories = useMemo(
    () => ['todas', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const visibleProducts =
    category === 'todas' ? products : products.filter((p) => p.category === category);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ecommerce FS77</h1>

        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <span>Hola, {profile?.displayName} ({profile?.role})</span>
            {isAdmin && <Link to="/admin" className="text-blue-600">Panel admin</Link>}
            <button onClick={logout} className="rounded-lg border px-4 py-2">
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="text-blue-600">Iniciar sesión</Link>
            <Link to="/register" className="text-blue-600">Registrarme</Link>
          </div>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Productos</h2>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border p-2"
            aria-label="Filtrar por categoría"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'todas' ? 'Todas las categorías' : c}
              </option>
            ))}
          </select>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <Spinner />
        ) : visibleProducts.length === 0 ? (
          <p>No hay productos para mostrar.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}