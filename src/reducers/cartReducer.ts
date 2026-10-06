import type { CartItem, Product } from '../types';

export type CartAction =
  | { type: 'add'; product: Product; quantity?: number }
  | { type: 'remove'; productId: string }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'clear' };

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const { product } = action;
      if (product.stock <= 0) return state;
      const quantity = action.quantity ?? 1;
      const existing = state.find((i) => i.product.id === product.id);

      if (existing) {
        return state.map((i) =>
          i.product.id === product.id
            ? { product, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i,
        );
      }
      return [...state, { product, quantity: Math.min(quantity, product.stock) }];
    }

    case 'remove':
      return state.filter((i) => i.product.id !== action.productId);

    case 'setQuantity':
      return state.map((i) =>
        i.product.id === action.productId
          ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.product.stock)) }
          : i,
      );

    case 'clear':
      return [];

    default:
      return state;
  }
}