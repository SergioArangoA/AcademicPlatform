/**
 * Cambié la validación de ruta protegida para usar useAuth()
 * en lugar de leer directamente de localStorage. 
 * Esto evita que la primera vez se redirija de nuevo
 * a /auth/signin antes de que el login de Google se complete.
 */

import { Navigate } from "react-router-dom";
import Loader from "../../common/Loader";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading, getRole } = useAuth();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (allowedRoles) {
    const role = getRole() ?? user?.role ?? null;
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/Acces-denied" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;