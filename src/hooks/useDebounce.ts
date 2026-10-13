import { useEffect, useState } from 'react';

// Devuelve el valor recién después de que el usuario dejó de tipear `delay` ms
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); 
  }, [value, delay]);

  return debounced;
}