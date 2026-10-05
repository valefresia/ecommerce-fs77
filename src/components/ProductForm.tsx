import { useState, type FormEvent } from 'react';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import type { Product } from '../types';
import type { ProductInput } from '../services/productService';
import {
  validateProduct,
  type ProductErrors,
  type ProductFormValues,
} from '../utils/productValidators';

interface Props {
  initial?: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel?: () => void;
}

export default function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial ? String(initial.price) : '',
    category: initial?.category ?? '',
    imageUrl: initial?.imageUrl ?? '',
    stock: initial ? String(initial.stock) : '',
  });
  const [errors, setErrors] = useState<ProductErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof ProductFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateProduct(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        category: values.category.trim(),
        imageUrl: values.imageUrl.trim(),
        stock: Number(values.stock),
      });
    } catch (err) {
      console.error(err);
      setSubmitError('No se pudo guardar el producto. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-lg font-bold">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
      {submitError && <ErrorMessage message={submitError} />}

      <FormInput label="Nombre" name="name" value={values.name}
        onChange={(e) => setField('name', e.target.value)} error={errors.name} />

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">Descripción</label>
        <textarea id="description" name="description" rows={3} value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          className="rounded-lg border p-2" />
        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
      </div>

      <FormInput label="Precio" name="price" type="number" value={values.price}
        onChange={(e) => setField('price', e.target.value)} error={errors.price} />
      <FormInput label="Stock" name="stock" type="number" value={values.stock}
        onChange={(e) => setField('stock', e.target.value)} error={errors.stock} />
      <FormInput label="Categoría" name="category" value={values.category}
        onChange={(e) => setField('category', e.target.value)} error={errors.category} />
      <FormInput label="Link de la imagen (opcional)" name="imageUrl" value={values.imageUrl}
        onChange={(e) => setField('imageUrl', e.target.value)} error={errors.imageUrl} />

      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {submitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear producto'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}