import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page-main not-found-page">
      <p className="eyebrow">ERROR 404</p>
      <h1>Esta página no existe</h1>
      <p>
        Puede que el enlace haya cambiado o que la dirección esté mal escrita.
      </p>
      <Link to="/" className="primary-action not-found-link">
        Volver al catálogo
      </Link>
    </main>
  );
}
