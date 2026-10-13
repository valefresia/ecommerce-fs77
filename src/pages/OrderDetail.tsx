import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../hooks/useOrder';
import { formatPrice, statusLabels } from '../utils/orderLabels';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { order, loading, error } = useOrder(id);

  if (loading) return <Spinner />;

  // Si el pedido es de otra persona, se muestra como si no existiera
  const visible = order && order.userId === user?.uid ? order : null;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <Link to="/orders" className="text-blue-600">← Volver a mis pedidos</Link>

      {error && <ErrorMessage message="No se pudo cargar el pedido." />}
      {!error && !visible && <p>No encontramos este pedido.</p>}

      {visible && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Detalle del pedido</h1>
            <p className="text-sm text-gray-600">
              {new Date(visible.createdAt).toLocaleString('es-AR')} · N.º {visible.id.slice(0, 8)}
            </p>
            <span className="w-fit rounded-full border px-3 py-1 text-sm">
              {statusLabels[visible.status]}
            </span>
          </header>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Productos</h2>
            <ul className="flex flex-col gap-2">
              {visible.items.map((i) => (
                <li
                  key={i.productId}
                  className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatPrice(i.price)} × {i.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(i.price * i.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-1 border-t pt-4">
            <p className="text-sm">
              {visible.payment
                ? `Pago: tarjeta terminada en ${visible.payment.last4} (simulado)`
                : 'Pago: sin datos registrados'}
            </p>
            <p className="text-xl font-bold">Total: {formatPrice(visible.total)}</p>
          </section>
        </>
      )}
    </main>
  );
}