import { useEffect, useState } from 'react';
import { getOrderById } from '../services/orderService';
import type { Order } from '../types';

interface Result {
  id: string;
  order: Order | null;
  error: boolean;
}

export function useOrder(id: string | undefined) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true; // evita actualizar el estado si ya cambió el id o se desmontó

    getOrderById(id)
      .then((order) => {
        if (active) setResult({ id, order, error: false });
      })
      .catch((err) => {
        console.error(err);
        if (active) setResult({ id, order: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Está cargando mientras el resultado guardado no sea del id actual
  const loading = !!id && result?.id !== id;

  return {
    order: loading ? null : (result?.order ?? null),
    loading,
    error: !loading && !!result?.error,
  };
}