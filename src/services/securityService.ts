import axios from "axios";
import { User } from "../models/User";
import { StorageProvider } from "../storage/StorageProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

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
        this.API_URL = import.meta.env.VITE_API_URL_SECURITY || "";
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
        console.log("llamando api " + `${this.API_URL}/login`);
        const response = await axios.post(`${this.API_URL}/login`, credentials, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status !== 200) {
            throw new Error(`Login failed with status ${response.status}`);
        }

        const data = response.data;

        this.user = data.user;

        if (!this.user) {
            throw new Error("La respuesta de login no contiene un usuario válido.");
        }

        this.storage.setItem(this.userKey, JSON.stringify(this.user));

        const token = data?.token;
        if (!token) {
            throw new Error("La respuesta de login no contiene token.");
        }

        this.storage.setItem(this.keyToken, token);

        store.dispatch(setUser(this.user));
        this.dispatchEvent(new CustomEvent("userChange", { detail: this.user }));

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