import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../test/renderWithProviders';
import { makeProfile, makeUser } from '../test/factories';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('expone el usuario, el perfil y el estado de carga', () => {
    const user = makeUser('u1');
    const profile = makeProfile({ uid: 'u1' });
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({ auth: { user, profile, loading: false } }),
    });

    expect(result.current.user).toBe(user);
    expect(result.current.profile?.displayName).toBe('Vale');
    expect(result.current.loading).toBe(false);
  });

  it('isAdmin es true solo si el rol es admin', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({
        auth: { user: makeUser(), profile: makeProfile({ role: 'admin' }) },
      }),
    });
    expect(result.current.isAdmin).toBe(true);
  });

  it('isAdmin es false para un cliente o sin perfil', () => {
    const customer = renderHook(() => useAuth(), {
      wrapper: createWrapper({
        auth: { user: makeUser(), profile: makeProfile({ role: 'customer' }) },
      }),
    });
    expect(customer.result.current.isAdmin).toBe(false);

    const anonymous = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(anonymous.result.current.isAdmin).toBe(false);
  });

  it('lanza un error claro si se usa fuera del AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe usarse dentro de <AuthProvider>',
    );
    spy.mockRestore();
  });
});