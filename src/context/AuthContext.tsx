
/**
 * AuthContext
 * 
 * Proveedor de estado global para la autenticación de la aplicación.
 * Orquesta la sesión del usuario (Firebase y Backend propio), persiste los 
 * datos en el almacenamiento local y expone los métodos de inicio y cierre 
 * de sesión para que estén disponibles en cualquier componente de React.
 */

/**
 * Ahora loginWithGoogle() guarda user y token inmediatamente en localStorage.
 * loginWithCredentials() también actualiza el store de Redux para mantener el estado sincronizado.
 */


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import firebaseAuthService from "../services/firebaseAuthService";
import { User as AppUser } from "../models/User";
import SecurityService from "../services/securityService";
import { store } from "../store/store";
import { setUser as setReduxUser } from "../store/userSlice";

type AuthUser = FirebaseUser | AppUser;

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithCredentials: async () => {},
  loginWithGitHub: async () => {},
  loginWithMicrosoft: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Carga inicial desde localStorage
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log("Usuario restaurado desde localStorage:", JSON.parse(storedUser));
      return JSON.parse(storedUser) as AuthUser;
    }
    console.log("No hay usuario guardado en cache.");
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) console.log("Token restaurado desde localStorage:", storedToken);
    return storedToken;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Guarda usuario en cache cada vez que cambia
  useEffect(() => {
    if (user) {
      console.log("Guardando usuario en localStorage:", user);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      console.log("Eliminando usuario del localStorage");
      localStorage.removeItem("user");
    }
  }, [user]);

  // Guarda token en cache cada vez que cambia
  useEffect(() => {
    if (token) {
      console.log("Guardando token en localStorage:", token);
      localStorage.setItem("token", token);
    } else {
      console.log("Eliminando token del localStorage");
      localStorage.removeItem("token");
    }
  }, [token]);

  // Observa el estado de Firebase (inicio/cierre de sesión)
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((firebaseUser, idToken) => {
      if (firebaseUser && idToken) {
        setUser(firebaseUser);
        setToken(idToken);
        console.log("Usuario autenticado desde Firebase:", firebaseUser);
      } else {
        console.log("Usuario cerró sesión o no está autenticado.");
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login con Google
  const loginWithGoogle = async () => {
    try {
      const { user: firebaseUser, token: idToken } = await firebaseAuthService.loginWithGoogle();
      console.log("Login con Google exitoso:", firebaseUser);

      setUser(firebaseUser);
      setToken(idToken);
      localStorage.setItem("user", JSON.stringify(firebaseUser));
      localStorage.setItem("token", idToken);
    } catch (error) {
      console.error(" Error en login con Google:", error);
      throw error;
    }
  };

  // Login con GitHub
  const loginWithGitHub = async () => {
    try {
      const { user: firebaseUser, token: idToken } = await firebaseAuthService.loginWithGitHub();
      console.log(" Login con GitHub exitoso:", firebaseUser);

      setUser(firebaseUser);
      setToken(idToken);
    } catch (error) {
      console.error("Error en login con GitHub:", error);
      throw error;
    }
  };

  // Login con Microsoft
  const loginWithMicrosoft = async () => {
    try {
      const { user: firebaseUser, token: idToken } = await firebaseAuthService.loginWithMicrosoft();
      console.log("Login con Microsoft exitoso:", firebaseUser);

      setUser(firebaseUser);
      setToken(idToken);

      localStorage.setItem("user", JSON.stringify(firebaseUser));
      localStorage.setItem("token", idToken);

    } catch (error) {
      console.error("Error en login con Microsoft:", error);
      throw error;
    }
  };

  // Login con usuario y contraseña (via backend Flask + Firebase)
  const loginWithCredentials = async (credentials: { email: string; password: string }) => {
    try {
      // 1. Autenticar en Firebase
      const { user: firebaseUser, token: idToken } = await firebaseAuthService.loginWithEmailPassword(
        credentials.email,
        credentials.password
      );
      console.log("Login con credenciales exitoso en Firebase:", firebaseUser);

      // 2. Autenticar en el Backend para obtener el perfil completo (incluyendo el rol)
      const response = await SecurityService.login(credentials);
      const appUser = response.user;

      setUser(firebaseUser);
      setToken(idToken);
      
      // Guardamos el usuario del backend en Redux y LocalStorage para la UI (como el rol)
      localStorage.setItem("user", JSON.stringify(appUser));
      localStorage.setItem("token", idToken);
      store.dispatch(setReduxUser(appUser));
      
    } catch (error) {
      console.error("Error en login con credenciales:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    console.log("Cerrando sesión...");
    await firebaseAuthService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginWithGoogle,
        loginWithGitHub,
        loginWithMicrosoft,
        loginWithCredentials,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};