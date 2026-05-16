export interface Evaluation {
    id?: string;
    subject_id: string;
    group_id: string;
    rubric_id?: string | null;
    name: string;
    description: string;
    weight: number;
    code?: string;
    deadline?: string;
    due_date?: string;
    status?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}
