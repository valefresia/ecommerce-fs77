import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { getOrdersByUser } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

const formatPrice = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

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
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
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
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">
                  {new Date(order.createdAt).toLocaleString('es-AR')}
                </span>
                <span className="rounded-full border px-3 py-1 text-sm">
                  {statusLabels[order.status]}
                </span>
              </div>
              <ul className="text-sm">
                {order.items.map((i) => (
                  <li key={i.productId}>
                    {i.name} × {i.quantity} — {formatPrice(i.price * i.quantity)}
                  </li>
                ))}
              </ul>
              <p className="font-bold">Total: {formatPrice(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}