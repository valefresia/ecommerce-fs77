export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
}

export type ProductErrors = Partial<Record<keyof ProductFormValues, string>>;

export function validateProduct(values: ProductFormValues): ProductErrors {
  const errors: ProductErrors = {};

  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!values.description.trim()) errors.description = 'La descripción es obligatoria.';
  if (!values.category.trim()) errors.category = 'La categoría es obligatoria.';

  const price = Number(values.price);
  if (!values.price || Number.isNaN(price) || price <= 0) {
    errors.price = 'El precio debe ser un número mayor a 0.';
  }

  const stock = Number(values.stock);
  if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'El stock debe ser un número entero, 0 o más.';
  }

  if (values.imageUrl.trim() && !/^https?:\/\//.test(values.imageUrl.trim())) {
    errors.imageUrl = 'El link de la imagen debe empezar con http:// o https://';
  }

  return errors;
}