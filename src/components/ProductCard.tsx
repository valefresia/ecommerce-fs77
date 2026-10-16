import { Link } from "react-router-dom";
import type { Product } from "../types";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const outOfStock = product.stock === 0;
  const stockLabel = outOfStock
    ? "Sin stock"
    : product.stock <= 3
      ? `Últimas unidades: ${product.stock}`
      : "Disponible";

  return (
    <Link to={`/products/${product.id}`} className="product-card-link block">
      <article className="product-card flex h-full flex-col overflow-hidden rounded-lg border transition hover:shadow-md">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card-image h-40 w-full object-cover"
          />
        ) : (
          <div className="product-card-image flex h-40 w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
            Sin imagen
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="text-xs uppercase text-gray-500">
            {product.category}
          </span>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-lg font-bold">
            {product.price.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </p>
          <span
            className={`stock-badge ${outOfStock ? "stock-badge-empty" : product.stock <= 3 ? "stock-badge-low" : "stock-badge-available"}`}
            aria-label={stockLabel}
          >
            {stockLabel}
          </span>
        </div>
      </article>
    </Link>
  );
}
