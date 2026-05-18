/** Cómo viene un grupo del API; también uso cupos e inscripciones en el listado */
export interface Group {
    id: string;
    subject_id?: string;
    semester_id?: string;
    teacher_id?: string | null;
    name?: string;
    group_code?: string;
    capacity?: number;
    is_archived?: boolean;
    enrolled_count?: number;
    available_capacity?: number;
    created_at?: string;
    updated_at?: string;
}
