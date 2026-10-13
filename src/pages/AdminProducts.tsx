import { useCallback, useEffect, useState } from 'react';
import ProductForm from '../components/ProductForm';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type ProductInput,
} from '../services/productService';
import { seedSampleProducts } from '../services/seedService';
import type { Product } from '../types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formKey, setFormKey] = useState(0); // cambia para limpiar el formulario
  const [reloadKey, setReloadKey] = useState(0); // cambia para volver a pedir los productos

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let active = true; // evita actualizar el estado si el componente ya se desmontó

    getProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setError('');
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
  }, [reloadKey]);

  const handleSave = async (input: ProductInput) => {
    if (editing) {
      await updateProduct(editing.id, input);
    } else {
      await createProduct(input);
    }
    setEditing(null);
    setFormKey((k) => k + 1);
    reload();
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Borrar "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      if (editing?.id === product.id) setEditing(null);
      reload();
    } catch (err) {
      console.error(err);
      setError('No se pudo borrar el producto.');
    }
  };

  const handleSeed = async () => {
    if (
      !window.confirm(
        'Se van a cargar los celulares de ejemplo que todavía no existan. ¿Seguimos?',
      )
    ) {
      return;
    }
    setSeeding(true);
    setError('');
    setNotice('');
    try {
      const created = await seedSampleProducts();
      setNotice(
        created === 0
          ? 'Los productos de ejemplo ya estaban cargados.'
          : `Se cargaron ${created} productos. Ahora editá cada uno para agregarle su imagen.`,
      );
      reload();
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos de ejemplo.');
    } finally {
      setSeeding(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditing(product);
    setFormKey((k) => k + 1);
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Gestión de productos</h1>

      <ProductForm
        key={formKey}
        initial={editing}
        onSubmit={handleSave}
        onCancel={editing ? cancelEdit : undefined}
      />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Productos ({products.length})</h2>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
          >
            {seeding ? 'Cargando...' : 'Cargar celulares de ejemplo'}
          </button>
        </div>

        {notice && <p className="text-sm text-green-700">{notice}</p>}
        {error && <ErrorMessage message={error} />}

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <p className="text-sm">Todavía no cargaste productos.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-500">
                      Sin foto
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm">
                      {p.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      {' · '}stock: {p.stock}{' · '}{p.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="rounded-lg border px-3 py-1">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="rounded-lg border px-3 py-1 text-red-600"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}