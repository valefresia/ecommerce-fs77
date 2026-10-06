import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useCart } from '../hooks/useCart';
import { useProduct } from '../hooks/useProducts';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id);
  const { items, addItem } = useCart();

  if (loading) return <Spinner />;

  const inCart = items.find((i) => i.product.id === product?.id)?.quantity ?? 0;
  const canAdd = !!product && product.stock > 0 && inCart < product.stock;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-blue-600">← Volver al catálogo</Link>
        <Link to="/cart" className="text-blue-600">Ir al carrito</Link>
      </div>

      {error && <ErrorMessage message="No se pudo cargar el producto." />}

      {!error && !product && <p>Este producto no existe o fue eliminado.</p>}

      {product && (
        <article className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name}
              className="h-80 w-full rounded-lg object-cover" />
          ) : (
            <div className="flex h-80 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              Sin imagen
            </div>
          )}

          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase text-gray-500">{product.category}</span>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold">
              {product.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
            </p>
            <p>{product.description}</p>
            <p className={product.stock === 0 ? 'text-red-600' : 'text-sm'}>
              {product.stock === 0 ? 'Sin stock' : `Stock disponible: ${product.stock}`}
            </p>

            <button
              onClick={() => addItem(product)}
              disabled={!canAdd}
              className="mt-2 w-fit rounded-lg bg-blue-600 px-6 py-2 font-medium text-white disabled:opacity-50"
            >
              {product.stock === 0 ? 'Sin stock' : canAdd ? 'Agregar al carrito' : 'Máximo alcanzado'}
            </button>
            {inCart > 0 && <p className="text-sm">Ya tenés {inCart} en el carrito.</p>}
          </div>
        </article>
      )}
    </main>
  );
}