import type { ApiTimestamps } from './common';
import type { GradeDetail } from './GradeDetails';

export type GradeStatus = 'DRAFT' | 'SENT';

/**
 * Nota — tabla `grades` / POST /api/evaluation/grades.
 * Identificación: enrollment_id + rubric_id.
 * Guardar calificación → DRAFT; registrar notas finales del grupo → SENT + is_locked.
 */
export interface Grade extends ApiTimestamps {
  id?: string;
  enrollment_id: string;
  rubric_id: string;
  final_score?: number;
  status?: GradeStatus | string;
  observations?: string | null;
  is_locked?: boolean;
  /** Presente en GET grade enriquecido por el servicio. */
  details?: GradeDetail[];
}
