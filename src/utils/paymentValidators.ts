export interface PaymentFormValues {
  holder: string;
  number: string;
  expiry: string; // MM/AA
  cvc: string;
}

export type PaymentErrors = Partial<Record<keyof PaymentFormValues, string>>;

export function validatePayment(values: PaymentFormValues, now: Date = new Date()): PaymentErrors {
  const errors: PaymentErrors = {};

  if (!values.holder.trim()) errors.holder = 'El nombre del titular es obligatorio.';

  const digits = values.number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) errors.number = 'El número debe tener 16 dígitos.';

  const match = /^(\d{2})\/(\d{2})$/.exec(values.expiry);
  if (!match) {
    errors.expiry = 'Usá el formato MM/AA.';
  } else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) {
      errors.expiry = 'El mes no es válido.';
    } else if (new Date(year, month, 1) <= now) {
      // La tarjeta vale hasta el último día del mes de vencimiento
      errors.expiry = 'La tarjeta está vencida.';
    }
  }

  if (!/^\d{3,4}$/.test(values.cvc)) errors.cvc = 'El código debe tener 3 o 4 dígitos.';

  return errors;
}