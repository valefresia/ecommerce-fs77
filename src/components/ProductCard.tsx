import type { Product } from '../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const outOfStock = product.stock === 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
          Sin imagen
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase text-gray-500">{product.category}</span>
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-lg font-bold">
          {product.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
        </p>
        {outOfStock && <p className="text-sm text-red-600">Sin stock</p>}
      </div>
    </article>
  );
}