import type { ApiTimestamps } from './common';

/**
 * Detalle de calificación — tabla `grade_details`
 * Vincula estudiante + escala (POST grade-details o dentro de POST grades.details).
 */
export interface GradeDetail extends ApiTimestamps {
    id?: string;
    scale_id: string;
    student_id: string;
    score?: number;
    comment?: string | null;
}

/**
 * Nota — tabla `grades` / POST /api/evaluation/grades
 * Identificación: enrollment_id + rubric_id (sin evaluation_id).
 * Body: enrollment_id, rubric_id, status, observations?, details[]
 */
export interface Grade extends ApiTimestamps {
    id?: string;
    enrollment_id: string;
    rubric_id: string;
    final_score?: number;
    status?: 'DRAFT' | 'SENT' | string;
    observations?: string | null;
    is_locked?: boolean;
    /** Presente en GET grade enriquecido por el servicio. */
    details?: GradeDetail[];
}
