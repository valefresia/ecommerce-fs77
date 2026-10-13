import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { logout } from "../services/authService";

export default function SiteChrome() {
  const { user, profile, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand" aria-label="Patagonix Tech, inicio">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <span className="brand-name">
            Patagonix <strong>Tech</strong>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Navegación principal">
          <NavLink to="/" end>
            Catálogo
          </NavLink>
          {user ? (
            <>
              <NavLink to="/orders">Mis pedidos</NavLink>
              {isAdmin && <NavLink to="/admin">Administración</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink to="/register">Crear cuenta</NavLink>
            </>
          )}
        </nav>

        <div className="site-actions">
          {user && (
            <>
              <span className="site-greeting">
                Hola, {profile?.displayName}
              </span>
              <button className="logout-button" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          )}
          <Link
            className="header-cart"
            to="/cart"
            aria-label={`Carrito, ${totalItems} productos`}
          >
            <span aria-hidden="true">Carrito</span>
            <span className="cart-count">{totalItems}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link to="/" className="footer-brand">
          Patagonix Tech
        </Link>
        <span>Tecnología y accesorios</span>
        <Link to="/">Volver al catálogo</Link>
      </div>
    </footer>
  );
}
