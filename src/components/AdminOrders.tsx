import { useCallback, useEffect, useMemo, useState } from 'react';
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

type StatusFilter = 'all' | OrderStatus;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [reloadKey, setReloadKey] = useState(0); // cambia para volver a pedir los pedidos

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let active = true; // evita actualizar el estado si el componente ya se desmontó

    getAllOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('No se pudieron cargar los pedidos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visibleOrders = useMemo(
    () => (statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter],
  );

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
      reload();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof OrderError ? err.message : 'No se pudo cambiar el estado del pedido.',
      );
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">
          Pedidos ({visibleOrders.length}
          {statusFilter !== 'all' ? ` de ${orders.length}` : ''})
        </h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filtrar pedidos por estado"
          className="rounded-lg border p-2"
        >
          <option value="all">Todos los estados</option>
          {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <p className="text-sm">Todavía no hay pedidos.</p>
      ) : visibleOrders.length === 0 ? (
        <p className="text-sm">No hay pedidos con el estado "{statusLabels[statusFilter as OrderStatus]}".</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
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