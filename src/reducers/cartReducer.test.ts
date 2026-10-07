import { describe, expect, it } from 'vitest';
import { cartReducer } from './cartReducer';
import type { CartItem, Product } from '../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Teclado',
  description: 'Teclado mecánico',
  price: 1000,
  category: 'Periféricos',
  imageUrl: '',
  stock: 5,
  createdAt: 0,
  ...overrides,
});

describe('cartReducer', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    const state = cartReducer([], { type: 'add', product: makeProduct() });
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(1);
  });

  it('suma la cantidad si el producto ya estaba en el carrito', () => {
    const product = makeProduct();
    const initial: CartItem[] = [{ product, quantity: 2 }];
    const state = cartReducer(initial, { type: 'add', product });
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(3);
  });

  it('no supera el stock disponible', () => {
    const product = makeProduct({ stock: 3 });
    const initial: CartItem[] = [{ product, quantity: 3 }];
    const state = cartReducer(initial, { type: 'add', product });
    expect(state[0].quantity).toBe(3);
  });

  it('ignora productos sin stock', () => {
    const state = cartReducer([], { type: 'add', product: makeProduct({ stock: 0 }) });
    expect(state).toHaveLength(0);
  });

  it('setQuantity respeta el mínimo 1 y el máximo del stock', () => {
    const product = makeProduct({ stock: 4 });
    const initial: CartItem[] = [{ product, quantity: 2 }];

    const tooLow = cartReducer(initial, { type: 'setQuantity', productId: 'p1', quantity: 0 });
    expect(tooLow[0].quantity).toBe(1);

    const tooHigh = cartReducer(initial, { type: 'setQuantity', productId: 'p1', quantity: 99 });
    expect(tooHigh[0].quantity).toBe(4);
  });

  it('quita un producto', () => {
    const initial: CartItem[] = [{ product: makeProduct(), quantity: 1 }];
    expect(cartReducer(initial, { type: 'remove', productId: 'p1' })).toHaveLength(0);
  });

  it('vacía el carrito', () => {
    const initial: CartItem[] = [{ product: makeProduct(), quantity: 1 }];
    expect(cartReducer(initial, { type: 'clear' })).toEqual([]);
  });
});