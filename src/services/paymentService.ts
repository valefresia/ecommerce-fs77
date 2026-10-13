import type { OrderPayment } from '../types';
import type { PaymentFormValues } from '../utils/paymentValidators';

// Errores tarjeta rechazada
export class PaymentError extends Error {}

// Número de prueba que simula un rechazo (como las tarjetas de prueba de las pasarelas reales)
const DECLINED_NUMBER = '4000000000000002';

// Simula el procesamiento de un pago. No llama a ningún servicio externo
//  no guarda nada: devuelve solo lo que se puede registrar en la orden.
export async function simulatePayment(card: PaymentFormValues): Promise<OrderPayment> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // "procesando..."

  const digits = card.number.replace(/\s/g, '');
  if (digits === DECLINED_NUMBER) {
    throw new PaymentError('La tarjeta fue rechazada. Probá con otra.');
  }

  return { method: 'simulated-card', last4: digits.slice(-4) };
}