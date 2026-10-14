import { describe, expect, it } from 'vitest';
import { validatePayment, type PaymentFormValues } from './paymentValidators';

// Fecha fija para que el test no dependa del día en que se ejecuta
const now = new Date(2026, 9, 13); // 13 de octubre de 2026

const valid: PaymentFormValues = {
  holder: 'Valentina Fresia',
  number: '4242 4242 4242 4242',
  expiry: '12/30',
  cvc: '123',
};

describe('validatePayment', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validatePayment(valid, now)).toEqual({});
  });

  it('exige el nombre del titular', () => {
    expect(validatePayment({ ...valid, holder: '  ' }, now).holder).toBeDefined();
  });

  it('exige 16 dígitos en el número, con o sin espacios', () => {
    expect(validatePayment({ ...valid, number: '4242424242424242' }, now).number).toBeUndefined();
    expect(validatePayment({ ...valid, number: '4242 4242' }, now).number).toBeDefined();
    expect(validatePayment({ ...valid, number: 'abcd abcd abcd abcd' }, now).number).toBeDefined();
  });

  it('exige el formato MM/AA y un mes válido', () => {
    expect(validatePayment({ ...valid, expiry: '1230' }, now).expiry).toBeDefined();
    expect(validatePayment({ ...valid, expiry: '13/30' }, now).expiry).toBeDefined();
    expect(validatePayment({ ...valid, expiry: '00/30' }, now).expiry).toBeDefined();
  });

  it('rechaza tarjetas vencidas y acepta las que vencen este mes', () => {
    expect(validatePayment({ ...valid, expiry: '09/26' }, now).expiry).toBeDefined(); // venció en septiembre
    expect(validatePayment({ ...valid, expiry: '10/26' }, now).expiry).toBeUndefined(); // vale hasta fin de octubre
  });

  it('exige un código de 3 o 4 dígitos', () => {
    expect(validatePayment({ ...valid, cvc: '12' }, now).cvc).toBeDefined();
    expect(validatePayment({ ...valid, cvc: '12345' }, now).cvc).toBeDefined();
    expect(validatePayment({ ...valid, cvc: '1234' }, now).cvc).toBeUndefined();
  });
});