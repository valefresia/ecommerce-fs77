import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-6 text-center">Cargando...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}