import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true; // evita actualizar el estado si el componente ya se desmontó

    getProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('No se pudieron cargar los productos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}