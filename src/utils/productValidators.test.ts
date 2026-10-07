import { describe, expect, it } from 'vitest';
import { validateProduct, type ProductFormValues } from './productValidators';

const valid: ProductFormValues = {
  name: 'Teclado',
  description: 'Teclado mecánico',
  price: '45000',
  category: 'Periféricos',
  imageUrl: '',
  stock: '10',
};

describe('validateProduct', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validateProduct(valid)).toEqual({});
  });

  it('marca como obligatorios nombre, descripción y categoría', () => {
    const errors = validateProduct({ ...valid, name: ' ', description: '', category: '' });
    expect(errors.name).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.category).toBeDefined();
  });

  it('rechaza precio 0, negativo o no numérico', () => {
    expect(validateProduct({ ...valid, price: '0' }).price).toBeDefined();
    expect(validateProduct({ ...valid, price: '-5' }).price).toBeDefined();
    expect(validateProduct({ ...valid, price: 'abc' }).price).toBeDefined();
  });

  it('rechaza stock negativo o con decimales, pero acepta 0', () => {
    expect(validateProduct({ ...valid, stock: '-1' }).stock).toBeDefined();
    expect(validateProduct({ ...valid, stock: '2.5' }).stock).toBeDefined();
    expect(validateProduct({ ...valid, stock: '0' }).stock).toBeUndefined();
  });

  it('exige que el link de la imagen empiece con http(s), pero es opcional', () => {
    expect(validateProduct({ ...valid, imageUrl: 'foto.png' }).imageUrl).toBeDefined();
    expect(validateProduct({ ...valid, imageUrl: 'https://sitio.com/foto.png' }).imageUrl).toBeUndefined();
    expect(validateProduct({ ...valid, imageUrl: '' }).imageUrl).toBeUndefined();
  });
});
