import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest no expone afterEach global, así que Testing Library no limpia solo
afterEach(() => {
  cleanup();
});