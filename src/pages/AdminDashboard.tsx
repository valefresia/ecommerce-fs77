import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type ProductInput,
} from "../services/productService";
import type { Product } from "../types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formKey, setFormKey] = useState(0); // cambia para limpiar el formulario

  const loadProducts = useCallback(async () => {
    try {
      setProducts(await getProducts());
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleSave = async (input: ProductInput) => {
    if (editing) {
      await updateProduct(editing.id, input);
    } else {
      await createProduct(input);
    }
    setEditing(null);
    setFormKey((k) => k + 1);
    await loadProducts();
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Borrar "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      if (editing?.id === product.id) setEditing(null);
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("No se pudo borrar el producto.");
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
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel admin</h1>
        <Link to="/" className="text-blue-600">
          Volver al inicio
        </Link>
      </div>

      <ProductForm
        key={formKey}
        initial={editing}
        onSubmit={handleSave}
        onCancel={editing ? cancelEdit : undefined}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Productos ({products.length})</h2>
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
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm">
                    {p.price.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                    {" · "}stock: {p.stock}
                    {" · "}
                    {p.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="rounded-lg border px-3 py-1"
                  >
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
    </main>
  );
}
