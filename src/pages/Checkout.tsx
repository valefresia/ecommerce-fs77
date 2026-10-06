import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { createOrder, OrderError } from '../services/orderService';

const formatPrice = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(false);

  // Si el carrito está vacío no hay nada que pagar (salvo que recién se haya confirmado)
  if (items.length === 0 && !placed) return <Navigate to="/cart" replace />;

  const handleConfirm = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      await createOrder(user.uid, items);
      setPlaced(true);
      clearCart();
      navigate('/orders', { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof OrderError
          ? err.message
          : 'No se pudo confirmar la compra. Intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Confirmar compra</h1>
        <Link to="/cart" className="text-blue-600">Volver al carrito</Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <ul className="flex flex-col gap-2">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex justify-between rounded-lg border p-3">
            <span>{product.name} × {quantity}</span>
            <span className="font-medium">{formatPrice(product.price * quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xl font-bold">Total: {formatPrice(totalPrice)}</p>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Confirmando...' : 'Confirmar compra'}
        </button>
      </div>
    </main>
  );
}