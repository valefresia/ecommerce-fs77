import { useState, type FormEvent } from 'react';
import FormInput from './FormInput';
import {
  validatePayment,
  type PaymentErrors,
  type PaymentFormValues,
} from '../utils/paymentValidators';

interface Props {
  submitting: boolean;
  total: string;
  onSubmit: (values: PaymentFormValues) => void;
}

// Formatean mientras se escribe: "4242 4242 4242 4242", "12/28"
const formatNumber = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const formatCvc = (v: string) => v.replace(/\D/g, '').slice(0, 4);

export default function PaymentForm({ submitting, total, onSubmit }: Props) {
  const [values, setValues] = useState<PaymentFormValues>({
    holder: '',
    number: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<PaymentErrors>({});

  const setField = (field: keyof PaymentFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validatePayment(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-lg font-bold">Pago con tarjeta</h2>
      <p className="text-sm text-gray-600">
        Es una simulación: los datos de la tarjeta no se guardan. Tarjeta de prueba aprobada:
        4242 4242 4242 4242. Rechazada: 4000 0000 0000 0002.
      </p>

      <FormInput label="Titular de la tarjeta" name="holder" value={values.holder}
        onChange={(e) => setField('holder', e.target.value)} error={errors.holder} />
      <FormInput label="Número de tarjeta" name="number" value={values.number}
        onChange={(e) => setField('number', formatNumber(e.target.value))} error={errors.number} />

      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Vencimiento (MM/AA)" name="expiry" value={values.expiry}
          onChange={(e) => setField('expiry', formatExpiry(e.target.value))} error={errors.expiry} />
        <FormInput label="Código (CVC)" name="cvc" value={values.cvc}
          onChange={(e) => setField('cvc', formatCvc(e.target.value))} error={errors.cvc} />
      </div>

      <button type="submit" disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white disabled:opacity-50">
        {submitting ? 'Procesando pago...' : `Pagar ${total}`}
      </button>
    </form>
  );
}