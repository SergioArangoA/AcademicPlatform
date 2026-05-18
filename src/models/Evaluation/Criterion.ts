import type { ApiTimestamps } from './common';

/**
 * Criterio — tabla `criteria` / POST /api/evaluation/criteria
 * Body: rubric_id, name, description, weight
 */
export interface Criterion extends ApiTimestamps {
    id?: string;
    rubric_id?: string;
    name: string;
    description?: string | null;
    weight: number;
    /** Solo UI; el backend no persiste orden. */
    order?: number;
}
