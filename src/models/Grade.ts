export interface GradeDetail {
    id?: string;
    scale_id: string;
    student_id?: string;
    score?: number;
    comment?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Grade {
    id?: string;
    enrollment_id: string;
    rubric_id: string;
    final_score?: number;
    status?: "DRAFT" | "SENT" | string;
    observations?: string;
    is_locked?: boolean;
    details?: GradeDetail[];
    created_at?: string;
    updated_at?: string;
}
