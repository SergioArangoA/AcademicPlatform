import { StorageProvider } from "./StorageProvider";

export class LocalStorageProvider implements StorageProvider {
    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }
    getParsedItem(key:string){
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }
}