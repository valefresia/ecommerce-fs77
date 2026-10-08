import { useState, type ChangeEvent, type FormEvent } from 'react';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import type { Product } from '../types';
import type { ProductInput } from '../services/productService';
import { uploadProductImage } from '../services/uploadService';
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

const MAX_IMAGE_MB = 5;

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const setField = (field: keyof ProductFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo tiene que ser una imagen.');
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setUploadError(`La imagen no puede pesar más de ${MAX_IMAGE_MB} MB.`);
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      setField('imageUrl', await uploadProductImage(file));
    } catch (err) {
      console.error(err);
      setUploadError('No se pudo subir la imagen. Intentá de nuevo.');
    } finally {
      setUploading(false);
    }
  };

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

      <div className="flex flex-col gap-2">
        <label htmlFor="image" className="text-sm font-medium">Imagen (opcional)</label>
        <input id="image" type="file" accept="image/*" onChange={handleFile}
          disabled={uploading} />
        {uploading && <p className="text-sm">Subiendo imagen...</p>}
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        {values.imageUrl && (
          <img src={values.imageUrl} alt="Vista previa" className="h-32 w-32 rounded-lg object-cover" />
        )}
      </div>

      <FormInput label="O pegá el link de una imagen" name="imageUrl" value={values.imageUrl}
        onChange={(e) => setField('imageUrl', e.target.value)} error={errors.imageUrl} />

      <div className="flex gap-2">
        <button type="submit" disabled={submitting || uploading}
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