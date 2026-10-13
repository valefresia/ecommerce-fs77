import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// aca firebase se mockea para que ningún test dependa de servicios externos
vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

// Vitest no expone afterEach global, así que se limpia explícitamente
afterEach(() => {
  cleanup();
  localStorage.clear(); // el carrito  persiste cada test arranca de cero
});