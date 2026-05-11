export interface Subject {
    id?: number | string;
    code: string;
    name: string;
    description: string;
    credits: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}