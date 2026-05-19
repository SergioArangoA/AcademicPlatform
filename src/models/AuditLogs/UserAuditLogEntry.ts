export interface UserAuditLogEntry {
    id: string;
    create_at?: string;
    update_at?: string;
    message: string;
    user: string;
    actor: string;
}