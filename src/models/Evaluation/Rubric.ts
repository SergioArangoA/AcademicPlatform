import type { ApiTimestamps } from './common';

/**
 * Rúbrica — tabla `rubrics` / POST|PUT /api/evaluation/rubrics
 * Body API: title, description, is_public, is_archived (sin subject_id ni teacher_id).
 */
export interface Rubric extends ApiTimestamps {
    id?: string;
    title: string;
    description?: string | null;
    is_public: boolean;
    is_archived: boolean;
}
