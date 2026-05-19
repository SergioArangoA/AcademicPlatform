import { UserAuditAction } from "../models/AuditLogs/UserAuditAction";
import { UserAuditLogEntry } from "../models/AuditLogs/UserAuditLogEntry";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";

class AuditLogService {
    private readonly storageKey = "user_audit_log";
    private readonly storage = new LocalStorageProvider();

    private buildId(): string {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    private getUserLabel(user: unknown): string {
        if (!user || typeof user !== "object") {
            return "usuario";
        }

        const candidate = user as Record<string, unknown>;
        const profile = candidate.profile && typeof candidate.profile === "object"
            ? (candidate.profile as Record<string, unknown>)
            : null;

        const firstName = candidate.first_name ?? profile?.first_name ?? "";
        const lastName = candidate.last_name ?? profile?.last_name ?? "";
        const fullName = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();

        return (
            fullName ||
            (typeof candidate.email === "string" ? candidate.email : "") ||
            (typeof candidate.code === "string" ? candidate.code : "") ||
            (typeof candidate.id === "string" ? candidate.id : "") ||
            "usuario"
        );
    }

    private getLoggedUserLabel(): string {
        const loggedUser = this.storage.getParsedItem("user");

        return this.getUserLabel(loggedUser);
    }

    private readEntries(): UserAuditLogEntry[] {
        const storedEntries = this.storage.getParsedItem(this.storageKey);

        return Array.isArray(storedEntries) ? storedEntries : [];
    }

    private saveEntries(entries: UserAuditLogEntry[]): void {
        this.storage.setItem(this.storageKey, JSON.stringify(entries));
    }

    recordUserMutation(action: UserAuditAction, user: unknown, message: string): UserAuditLogEntry {
        const now = new Date().toISOString();
        const entry: UserAuditLogEntry = {
            id: this.buildId(),
            message: message || "Sin mensaje del backend",
            user: this.getUserLabel(user),
            actor: this.getLoggedUserLabel(),
            ...(action === "create_at" ? { create_at: now } : { update_at: now }),
        };

        const entries = this.readEntries();
        entries.unshift(entry);
        this.saveEntries(entries);

        return entry;
    }

    getEntries(): UserAuditLogEntry[] {
        return this.readEntries();
    }

    clear(): void {
        this.storage.removeItem(this.storageKey);
    }
}

export const auditLogService = new AuditLogService();