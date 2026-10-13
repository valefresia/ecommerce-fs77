import type { User } from 'firebase/auth';
import type { Product, UserProfile } from '../types';

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'iPhone 17 256 GB',
  description: 'Celular de prueba',
  price: 1000,
  category: 'iPhone',
  imageUrl: '',
  stock: 5,
  createdAt: 0,
  ...overrides,
});

export const makeProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  uid: 'u1',
  email: 'vale@test.com',
  displayName: 'Vale',
  role: 'customer',
  createdAt: 0,
  ...overrides,
});

// Usuario de Firebase mínimo, solo con lo que usa la app
export const makeUser = (uid = 'u1') => ({ uid, email: 'vale@test.com' }) as User;