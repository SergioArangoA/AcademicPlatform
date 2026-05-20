export interface UpdateEvaluationPayload {
    subject_id?: string;
    group_id?: string;
    rubric_id?: string | null;
    name?: string;
    description?: string;
    weight?: number;
}
