/**
 * Cambié la validación de ruta protegida para usar useAuth()
 * en lugar de leer directamente de localStorage. 
 * Esto evita que la primera vez se redirija de nuevo
 * a /auth/signin antes de que el login de Google se complete.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// Componente de Ruta Protegida
const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;