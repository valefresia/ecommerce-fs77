import { useEffect, useState } from "react";
import { getProductById, getProducts } from "../services/productService";
import type { Product } from "../types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("No se pudieron cargar los productos.");
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

interface Result {
  id: string;
  product: Product | null;
  error: boolean;
}

export function useProduct(id: string | undefined) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true; // evita actualizar el estado si ya cambió el id o se desmontó

    getProductById(id)
      .then((product) => {
        if (active) setResult({ id, product, error: false });
      })
      .catch((err) => {
        console.error(err);
        if (active) setResult({ id, product: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Está cargando mientras el resultado guardado no sea del id actual
  const loading = !!id && result?.id !== id;

  return {
    product: loading ? null : (result?.product ?? null),
    loading,
    error: !loading && !!result?.error,
  };
}
