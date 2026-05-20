import axios from "axios";
import { User } from "../models/User";
import { StorageProvider } from "../storage/StorageProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import { LoginCredentials } from "../models/Services/LoginCredentials";
import { LoginResponse } from "../models/Services/LoginResponse";

class SecurityService extends EventTarget {
    private readonly keyToken: string;
    private readonly userKey: string;
    private readonly API_URL: string;
    private user: User | null;
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        super();

        this.storage = storage;
        this.keyToken = "token";
        this.userKey = "user";
        this.API_URL = import.meta.env.VITE_API_URL || "";
        this.user = this.loadStoredUser();
    }

    private loadStoredUser(): User | null {
        const storedUser = this.storage.getItem(this.userKey);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Error parsing stored user:", error);
            this.storage.removeItem(this.userKey);
            return null;
        }
    }

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        // Paso 1: Se realiza la peticion HTTP POST al endpoint de login del backend.
        // Esto enviara las credenciales al API de Flask para su verificacion.
        console.log("llamando api " + `${this.API_URL}/auth/login`);
        const response = await axios.post(`${this.API_URL}/auth/login`, credentials, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status !== 200) {
            throw new Error(`Login failed with status ${response.status}`);
        }

        // Paso 2: El backend Flask retorna la informacion envuelta en un objeto data.
        // Debido a que axios tambien envuelve la respuesta en data, extraemos usando response.data.data.
        const payload = response.data.data;

        // Paso 3: Se extrae el objeto usuario del payload devuelto por el API.
        this.user = payload?.user;

        if (!this.user) {
            throw new Error("La respuesta de login no contiene un usuario válido.");
        }

        // Paso 4: Se guarda el usuario localmente para mantener la sesion activa.
        this.storage.setItem(this.userKey, JSON.stringify(this.user));

        // Paso 5: Se obtiene el token de acceso que el API de Flask genera para el usuario.
        // Notese que el backend devuelve la propiedad como access_token.
        const token = payload?.access_token;
        if (!token) {
            throw new Error("La respuesta de login no contiene token.");
        }

        // Paso 6: Se guarda el token de forma local para futuras peticiones autenticadas.
        this.storage.setItem(this.keyToken, token);

        // Paso 7: Se actualiza el estado global de la aplicacion y se notifica el inicio de sesion exitoso.
        store.dispatch(setUser(this.user));
        this.dispatchEvent(new CustomEvent("userChange", { detail: this.user }));

        // Se retorna el usuario y su respectivo token.
        return { user: this.user, token };
    }

    getUser() {
        return this.user;
    }

    logout() {
        this.user = null;

        this.storage.removeItem(this.userKey);
        this.storage.removeItem(this.keyToken);

        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        store.dispatch(setUser(null));
    }

    isAuthenticated() {
        return this.storage.getItem(this.keyToken) !== null;
    }

    getToken() {
        return this.storage.getItem(this.keyToken);
    }
}

export default new SecurityService();