export interface Evaluation {
    id?: string;
    subject_id: string;
    group_id: string;
    rubric_id?: string | null;
    name: string;
    description: string;
    weight: number;
    created_at?: string;
    updated_at?: string;
}
