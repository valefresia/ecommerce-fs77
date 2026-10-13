import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-600 text-white' : 'text-slate-200 hover:bg-slate-700'
  }`;

export default function AdminLayout() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <aside className="flex flex-col gap-4 bg-slate-800 p-4 text-white md:w-60 md:shrink-0">
        <div>
          <p className="text-lg font-bold">Patagonix Tech</p>
          <p className="text-xs text-slate-300">Panel de administración</p>
        </div>

        <nav className="flex gap-2 md:flex-col">
          <NavLink to="/admin" end className={linkClass}>
            Productos
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            Pedidos
          </NavLink>
        </nav>

        <div className="flex flex-wrap items-center gap-3 text-sm md:mt-auto md:flex-col md:items-start">
          <span className="text-slate-300">{profile?.displayName}</span>
          <Link to="/" className="underline">
            Ir a la tienda
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-500 px-3 py-1"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}