import type { ApiTimestamps } from './common';

/**
 * Detalle de calificación — tabla `grade_details`.
 * Una fila por criterio calificado (estudiante + escala + puntaje parcial).
 */
export interface GradeDetail extends ApiTimestamps {
  id?: string;
  scale_id: string;
  student_id: string;
  score?: number;
  comment?: string | null;
}

/** @deprecated Usar `GradeDetail` (singular, alineado al backend). */
export type GradeDetails = GradeDetail;
