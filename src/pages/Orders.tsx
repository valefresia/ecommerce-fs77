import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { getOrdersByUser } from '../services/orderService';
import type { Order } from '../types';
import { formatPrice, statusLabels } from '../utils/orderLabels';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;

    getOrdersByUser(user.uid)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('No se pudieron cargar tus pedidos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis pedidos</h1>
        <Link to="/" className="text-blue-600">Volver al inicio</Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <p>Todavía no hiciste ningún pedido.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <li
                key={order.id}
                className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString('es-AR')}
                  </span>
                  <span className="w-fit rounded-full border px-3 py-1 text-sm">
                    {statusLabels[order.status]}
                  </span>
                  <span className="text-sm">
                    {units} {units === 1 ? 'producto' : 'productos'} ·{' '}
                    <strong>{formatPrice(order.total)}</strong>
                  </span>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="w-fit rounded-lg border px-4 py-2 text-blue-600"
                >
                  Ver detalle
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}