import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <p className="p-6 text-center">Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}