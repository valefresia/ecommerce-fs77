import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const formatPrice = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default function Cart() {
  const { items, totalPrice, setQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi carrito</h1>
        <Link to="/" className="text-blue-600">
          Seguir comprando
        </Link>
      </div>

      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div>
                  <Link to={`/products/${product.id}`} className="font-medium">
                    {product.name}
                  </Link>
                  <p className="text-sm">{formatPrice(product.price)} c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(product.id, quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="Restar uno"
                    className="rounded-lg border px-3 py-1 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    aria-label="Sumar uno"
                    className="rounded-lg border px-3 py-1 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    {formatPrice(product.price * quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-red-600"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
            <button onClick={clearCart} className="rounded-lg border px-4 py-2">
              Vaciar carrito
            </button>
            <p className="text-xl font-bold">
              Total: {formatPrice(totalPrice)}
            </p>
            <Link
              to="/checkout"
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white"
            >
              Finalizar compra
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
