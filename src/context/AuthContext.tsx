
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
import { setUser as setReduxUser, clearUser } from "../store/userSlice";

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
  getRole: () => string | null;
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
  getRole: () => null,
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
    const backendToken = SecurityService.getToken();
    const storedToken = localStorage.getItem("token");
    const resolved = backendToken || storedToken;
    if (resolved) console.log("Token de API restaurado desde almacenamiento");
    return resolved;
  });

  const [loading, setLoading] = useState<boolean>(true);

  const mergeFirebaseAndStoredUser = (firebaseUser: FirebaseUser, storedUser: AuthUser | null): AuthUser => {
    if (!storedUser || !('role' in storedUser)) {
      return firebaseUser;
    }

    return {
      ...storedUser,
      ...firebaseUser,
      role: storedUser.role,
      first_name: storedUser.first_name,
      last_name: storedUser.last_name,
      identification: storedUser.identification,
      phone: storedUser.phone,
      speciality: storedUser.speciality,
      user_id: storedUser.user_id,
      profile: storedUser.profile,
    };
  };

  // Completa profile.id en sesiones guardadas antes de persistir el perfil completo
  useEffect(() => {
    const appUser = user as AppUser | null;
    if (!appUser?.id || !token || appUser.profile?.id) return;
    if (appUser.role !== 'TEACHER' && appUser.role !== 'STUDENT') return;

    let cancelled = false;
    (async () => {
      try {
        const profileRes = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${appUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!profileRes.ok || cancelled) return;
        const data = await profileRes.json();
        const profileData = data?.data?.profile;
        if (!profileData?.id || cancelled) return;
        setUser((prev) => {
          if (!prev || (prev as AppUser).profile?.id) return prev;
          return {
            ...(prev as AppUser),
            profile: profileData,
            first_name: profileData.first_name || (prev as AppUser).first_name,
            last_name: profileData.last_name || (prev as AppUser).last_name,
          };
        });
      } catch (err) {
        console.error('No se pudo hidratar el perfil del usuario', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, token]);

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

  const resolveApiToken = (firebaseIdToken: string): string => {
    const backendToken = SecurityService.getToken();
    if (backendToken && backendToken !== firebaseIdToken) {
      return backendToken;
    }
    try {
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? (JSON.parse(storedUser) as AppUser) : null;
      if (parsed?.role && backendToken) {
        return backendToken;
      }
    } catch {
      /* ignore */
    }
    return firebaseIdToken;
  };

  // Observa el estado de Firebase (inicio/cierre de sesión)
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((firebaseUser, idToken) => {
      if (firebaseUser && idToken) {
        setUser((prevUser) => mergeFirebaseAndStoredUser(firebaseUser, prevUser));
        setToken(resolveApiToken(idToken));
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
      store.dispatch(setReduxUser(JSON.parse(JSON.stringify(firebaseUser)) as any));
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
      localStorage.setItem("user", JSON.stringify(firebaseUser));
      localStorage.setItem("token", idToken);
      store.dispatch(setReduxUser(JSON.parse(JSON.stringify(firebaseUser)) as any));
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
      store.dispatch(setReduxUser(JSON.parse(JSON.stringify(firebaseUser)) as any));

    } catch (error) {
      console.error("Error en login con Microsoft:", error);
      throw error;
    }
  };

  // Login con usuario y contrasena (via backend Flask + Firebase)
  const loginWithCredentials = async (credentials: { email: string; password: string }) => {
    try {
      // Paso 1: Autenticar en Firebase usando correo y contrasena.
      // Esto devuelve el usuario de Firebase y un token de autenticacion (idToken).
      const { user: firebaseUser, token: idToken } = await firebaseAuthService.loginWithEmailPassword(
        credentials.email,
        credentials.password
      );
      console.log("Login con credenciales exitoso en Firebase:", firebaseUser);

      // Paso 2: Autenticar en el Backend para obtener el perfil completo (incluyendo el rol).
      // El backend verificara las credenciales y devolvera el perfil del usuario y un access_token.
      const response = await SecurityService.login(credentials);
      const appUser = response.user;

      // Paso 3: Obtener el perfil completo desde el backend usando el token
      let firstName = "";
      let lastName = "";
      let profile: AppUser["profile"] = undefined;
      try {
          const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${appUser.id}`, {
              headers: { 'Authorization': `Bearer ${response.token}` }
          });
          if (profileRes.ok) {
              const data = await profileRes.json();
              const profileData = data?.data?.profile;
              if (profileData) {
                  profile = profileData;
                  firstName = profileData.first_name || "";
                  lastName = profileData.last_name || "";
              } else if (appUser.role === 'ADMIN') {
                  firstName = "Administrador";
                  lastName = `(${appUser.code || ''})`;
              }
          }
      } catch (err) {
          console.error("No se pudo obtener el perfil extra del usuario", err);
      }

      const firebaseUserJson = JSON.parse(JSON.stringify(firebaseUser));
      const mergedUser = { 
          ...appUser, 
          ...firebaseUserJson, 
          role: appUser.role, 
          first_name: firstName, 
          last_name: lastName,
          profile,
      };

      // Token del API Flask (no el de Firebase) para Authorization en peticiones REST.
      const apiToken = response.token;

      setUser(mergedUser);
      setToken(apiToken);

      localStorage.setItem("user", JSON.stringify(mergedUser));
      localStorage.setItem("token", apiToken);
      store.dispatch(setReduxUser(JSON.parse(JSON.stringify(mergedUser)) as any));
      
    } catch (error) {
      console.error("Error en login con credenciales:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    console.log("Cerrando sesión...");
    await firebaseAuthService.logout();
    SecurityService.logout();
    setUser(null);
    setToken(null);
    store.dispatch(clearUser());
  };

  function getRole(){
    const storedUser = JSON.parse(localStorage.getItem("user") || 'null');
    if (storedUser && storedUser.role) {
      return storedUser.role;
    }
    console.log("No hay usuario guardado en cache.");
    return null;
  }

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
        getRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};