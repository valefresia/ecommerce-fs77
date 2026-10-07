import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProductCard from './ProductCard';
import type { Product } from '../types';

const product: Product = {
  id: 'abc123',
  name: 'Mouse gamer',
  description: 'Mouse inalámbrico',
  price: 25000,
  category: 'Periféricos',
  imageUrl: '',
  stock: 3,
  createdAt: 0,
};

const renderCard = (p: Product) =>
  render(
    <MemoryRouter>
      <ProductCard product={p} />
    </MemoryRouter>,
  );

describe('ProductCard', () => {
  it('muestra nombre y categoría, y linkea al detalle', () => {
    renderCard(product);
    expect(screen.getByText('Mouse gamer')).toBeInTheDocument();
    expect(screen.getByText('Periféricos')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/abc123');
  });

  it('muestra "Sin imagen" cuando no hay imageUrl', () => {
    renderCard(product);
    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
  });

  it('avisa cuando no hay stock', () => {
    renderCard({ ...product, stock: 0 });
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });
});