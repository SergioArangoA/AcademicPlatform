/**
 * Pesos de evaluaciones por asignatura: la suma de weight de todas las
 * evaluaciones con el mismo subject_id debe ser exactamente 100 %.
 */

export type EvaluationWeightItem = {
  id?: string;
  subject_id?: string | number | null;
  weight?: number;
};

export function normalizeSubjectId(subjectId: string | number | null | undefined): string {
  if (subjectId == null || subjectId === '') return '';
  return String(subjectId);
}

/** Suma de pesos de evaluaciones de una asignatura (opcional: excluir una al editar). */
export function sumEvaluationWeightsForSubject(
  evaluations: EvaluationWeightItem[],
  subjectId: string,
  excludeEvaluationId?: string
): number {
  const sid = normalizeSubjectId(subjectId);
  if (!sid) return 0;

  return evaluations
    .filter((ev) => {
      if (normalizeSubjectId(ev.subject_id) !== sid) return false;
      if (excludeEvaluationId && ev.id != null && String(ev.id) === excludeEvaluationId) {
        return false;
      }
      return true;
    })
    .reduce((acc, ev) => acc + Number(ev.weight ?? 0), 0);
}

export type SubjectWeightCheck = {
  subjectId: string;
  total: number;
  isValid: boolean;
  remaining: number;
};

export function checkSubjectWeightTotal(total: number): Omit<SubjectWeightCheck, 'subjectId'> {
  const rounded = Math.round(total * 100) / 100;
  const isValid = Math.abs(rounded - 100) < 0.01;
  return {
    total: rounded,
    isValid,
    remaining: Math.round((100 - rounded) * 100) / 100,
  };
}

export function checkSubjectWeights(
  evaluations: EvaluationWeightItem[],
  subjectId: string,
  excludeEvaluationId?: string
): SubjectWeightCheck {
  const total = sumEvaluationWeightsForSubject(
    evaluations,
    subjectId,
    excludeEvaluationId
  );
  const check = checkSubjectWeightTotal(total);
  return { subjectId: normalizeSubjectId(subjectId), ...check };
}

/** Valida si se puede añadir o actualizar un peso sin superar 100 %. */
export function validateEvaluationWeightChange(
  evaluations: EvaluationWeightItem[],
  subjectId: string,
  newWeight: number,
  excludeEvaluationId?: string
): { allowed: boolean; message: string; currentSum: number; projectedSum: number } {
  const currentSum = sumEvaluationWeightsForSubject(
    evaluations,
    subjectId,
    excludeEvaluationId
  );
  const projectedSum = Math.round((currentSum + newWeight) * 100) / 100;

  if (newWeight <= 0 || newWeight > 100) {
    return {
      allowed: false,
      message: 'El peso debe estar entre 1 y 100.',
      currentSum,
      projectedSum,
    };
  }

  if (projectedSum > 100.001) {
    return {
      allowed: false,
      message: `Con este peso la asignatura sumaría ${projectedSum}% (máximo 100%). Actualmente hay ${currentSum}% asignados.`,
      currentSum,
      projectedSum,
    };
  }

  return {
    allowed: true,
    message:
      projectedSum === 100
        ? 'La asignatura queda con 100% en evaluaciones.'
        : `Tras guardar quedarán ${projectedSum}% de 100% en esta asignatura (faltan ${Math.round((100 - projectedSum) * 100) / 100}%).`,
    currentSum,
    projectedSum,
  };
}

/** Resumen por asignatura para el listado del docente. */
export function summarizeWeightsBySubject(
  evaluations: EvaluationWeightItem[]
): Map<string, SubjectWeightCheck> {
  const bySubject = new Map<string, EvaluationWeightItem[]>();

  evaluations.forEach((ev) => {
    const sid = normalizeSubjectId(ev.subject_id);
    if (!sid) return;
    const list = bySubject.get(sid) ?? [];
    list.push(ev);
    bySubject.set(sid, list);
  });

  const result = new Map<string, SubjectWeightCheck>();
  bySubject.forEach((list, subjectId) => {
    result.set(subjectId, checkSubjectWeights(list, subjectId));
  });

  return result;
}
