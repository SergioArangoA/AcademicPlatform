import type { ApiTimestamps } from './common';

/**
 * Evaluación — tabla `evaluations` / /api/evaluation/evaluations
 * POST: subject_id, group_id, name, description, weight
 * PUT: puede incluir rubric_id para asociar rúbrica.
 */
export interface Evaluation extends ApiTimestamps {
    id?: string;
    subject_id: string;
    group_id: string;
    rubric_id?: string | null;
    name: string;
    description?: string | null;
    weight: number;
}
