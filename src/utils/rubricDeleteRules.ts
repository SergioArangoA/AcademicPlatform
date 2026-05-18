import type { RubricVisibility } from './teacher/rubricFilters';

/**
 * Solo se pueden borrar plantillas propias sin evaluación asociada
 * (visibility === 'shared' en el listado del docente).
 */
export function canTeacherDeleteRubric(rubric: {
  visibility?: RubricVisibility;
}): boolean {
  return rubric.visibility === 'shared';
}
