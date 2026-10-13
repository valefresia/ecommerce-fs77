import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import PaymentForm from '../components/PaymentForm';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { createOrder, OrderError } from '../services/orderService';
import { PaymentError, simulatePayment } from '../services/paymentService';
import type { PaymentFormValues } from '../utils/paymentValidators';

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

  const handlePay = async (card: PaymentFormValues) => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      // 1) Se simula el cobro  2) si se aprueba, se crea la orden (stock + pedido en una transacción)
      const payment = await simulatePayment(card);
      await createOrder(user.uid, items, payment);
      setPlaced(true);
      clearCart();
      navigate('/orders', { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof OrderError || err instanceof PaymentError
          ? err.message
          : 'No se pudo confirmar la compra. Intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Confirmar compra</h1>
        <Link to="/cart" className="text-blue-600">Volver al carrito</Link>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Resumen</h2>
        <ul className="flex flex-col gap-2">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-4 rounded-lg border p-3">
              <span>{product.name} × {quantity}</span>
              <span className="font-medium">{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="text-right text-xl font-bold">Total: {formatPrice(totalPrice)}</p>
      </section>

      {error && <ErrorMessage message={error} />}

      <PaymentForm submitting={submitting} total={formatPrice(totalPrice)} onSubmit={handlePay} />
    </main>
  );
}