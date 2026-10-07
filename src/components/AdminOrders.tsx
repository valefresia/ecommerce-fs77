import { useCallback, useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Spinner from './Spinner';
import { getAllOrders, OrderError, updateOrderStatus } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

const formatPrice = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getAllOrders());
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleChange = async (order: Order, status: OrderStatus) => {
    if (
      status === 'cancelled' &&
      !window.confirm('Al cancelar el pedido se devuelve el stock. ¿Seguro?')
    ) {
      return;
    }
    setError('');
    try {
      await updateOrderStatus(order.id, status);
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof OrderError ? err.message : 'No se pudo cambiar el estado del pedido.',
      );
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">Pedidos ({orders.length})</h2>
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <p className="text-sm">Todavía no hay pedidos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">
                  {new Date(order.createdAt).toLocaleString('es-AR')} · cliente{' '}
                  {order.userId.slice(0, 6)}…
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleChange(order, e.target.value as OrderStatus)}
                  disabled={order.status === 'cancelled'}
                  aria-label="Estado del pedido"
                  className="rounded-lg border p-1"
                >
                  {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
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
    </section>
  );
}