import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { makeProfile, makeUser } from '../test/factories';
import { renderWithProviders } from '../test/renderWithProviders';
import AdminRoute from './AdminRoute';
import ProtectedRoute from './ProtectedRoute';

const protectedApp = (
  <Routes>
    <Route path="/login" element={<p>Pantalla de login</p>} />
    <Route element={<ProtectedRoute />}>
      <Route path="/orders" element={<p>Mis pedidos</p>} />
    </Route>
  </Routes>
);

const adminApp = (
  <Routes>
    <Route path="/login" element={<p>Pantalla de login</p>} />
    <Route path="/" element={<p>Tienda</p>} />
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<p>Panel admin</p>} />
    </Route>
  </Routes>
);

describe('ProtectedRoute', () => {
  it('manda al login a quien no tiene sesión', () => {
    renderWithProviders(protectedApp, { route: '/orders' });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Mis pedidos')).not.toBeInTheDocument();
  });

  it('deja pasar a un usuario logueado', () => {
    renderWithProviders(protectedApp, {
      route: '/orders',
      auth: { user: makeUser(), profile: makeProfile() },
    });
    expect(screen.getByText('Mis pedidos')).toBeInTheDocument();
  });

  it('no muestra nada protegido mientras la sesión está cargando', () => {
    renderWithProviders(protectedApp, { route: '/orders', auth: { loading: true } });
    expect(screen.queryByText('Mis pedidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('manda al login a quien no tiene sesión', () => {
    renderWithProviders(adminApp, { route: '/admin' });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('manda a la tienda a un cliente', () => {
    renderWithProviders(adminApp, {
      route: '/admin',
      auth: { user: makeUser(), profile: makeProfile({ role: 'customer' }) },
    });
    expect(screen.getByText('Tienda')).toBeInTheDocument();
    expect(screen.queryByText('Panel admin')).not.toBeInTheDocument();
  });

  it('deja pasar a un admin', () => {
    renderWithProviders(adminApp, {
      route: '/admin',
      auth: { user: makeUser(), profile: makeProfile({ role: 'admin' }) },
    });
    expect(screen.getByText('Panel admin')).toBeInTheDocument();
  });
});