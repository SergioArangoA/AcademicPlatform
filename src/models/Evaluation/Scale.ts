import type { ApiTimestamps } from './common';

/**
 * Escala — tabla `scales` / POST /api/evaluation/scales
 * Body: criterion_id, name, description, value
 */
export interface Scale extends ApiTimestamps {
    id?: string;
    criterion_id: string;
    name: string;
    description?: string | null;
    value: number;
}
