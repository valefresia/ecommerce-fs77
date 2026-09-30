import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';

export default function Home() {
  const { user, profile, isAdmin } = useAuth();
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Ecommerce FS77</h1>
      {user ? (
        <div className="mt-4 flex flex-col gap-2">
          <p>Hola, {profile?.displayName} ({profile?.role})</p>
          {isAdmin && <Link to="/admin" className="text-blue-600">Ir al panel admin</Link>}
          <button onClick={logout} className="w-fit rounded-lg border px-4 py-2">Cerrar sesión</button>
        </div>
      ) : (
        <Link to="/login" className="mt-4 inline-block text-blue-600">Iniciar sesión</Link>
      )}
    </main>
  );
}