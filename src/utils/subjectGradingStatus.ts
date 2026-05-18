import type { TeacherEvaluationRow } from './teacher/evaluationData';

/** Estado para registrar notas finales de una asignatura. */
export function getSubjectFinalGradesStatus(
  evaluations: TeacherEvaluationRow[],
  subjectId: string
): {
  canRegister: boolean;
  message: string;
  subjectEvaluations: TeacherEvaluationRow[];
  pendingCount: number;
} {
  const subjectEvaluations = evaluations.filter(
    (ev) => String(ev.subject_id) === String(subjectId)
  );

  if (subjectEvaluations.length === 0) {
    return {
      canRegister: false,
      message: 'No hay evaluaciones en esta asignatura.',
      subjectEvaluations: [],
      pendingCount: 0,
    };
  }

  const withoutRubric = subjectEvaluations.filter((ev) => !ev.rubric_id);
  if (withoutRubric.length > 0) {
    return {
      canRegister: false,
      message: `${withoutRubric.length} evaluación(es) sin rúbrica. Asócialas antes de registrar notas.`,
      subjectEvaluations,
      pendingCount: withoutRubric.length,
    };
  }

  let pendingCount = 0;
  for (const ev of subjectEvaluations) {
    const missing = ev.students_total - ev.students_graded;
    if (missing > 0) pendingCount += missing;
  }

  if (pendingCount > 0) {
    return {
      canRegister: false,
      message: `Faltan ${pendingCount} calificación(es) en borrador (guardar) en esta asignatura.`,
      subjectEvaluations,
      pendingCount,
    };
  }

  return {
    canRegister: true,
    message:
      'Todas las calificaciones están en borrador. Puedes registrar las notas finales (pasarán a enviadas).',
    subjectEvaluations,
    pendingCount: 0,
  };
}
