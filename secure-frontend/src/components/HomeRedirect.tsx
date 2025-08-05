import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />;
}
