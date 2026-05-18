export interface StorageProvider {
    getItem(key: string): string | null;
    getParsedItem(key: string): any;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}