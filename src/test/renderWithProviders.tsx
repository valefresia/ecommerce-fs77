import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

interface ProviderOptions {
  route?: string; // ruta inicial del router
  auth?: Partial<AuthContextValue>; // quién está logueado en este test
}

// Router + Auth (con valor controlado, sin Firebase) + Cart real
export function createWrapper({ route = '/', auth }: ProviderOptions = {}) {
  const value: AuthContextValue = { user: null, profile: null, loading: false, ...auth };

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider value={value}>
          <CartProvider>{children}</CartProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { route, auth, ...renderOptions } = options;
  return render(ui, { wrapper: createWrapper({ route, auth }), ...renderOptions });
}