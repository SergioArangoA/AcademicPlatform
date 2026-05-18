/**
 * Normalizo criterios del API (nombres en español/inglés) para listados, filtros y validación.
 */
import { Criterion } from '../models/Evaluation/Criterion';

export type CriterionLike = Criterion & {
  rubricId?: string | number;
  rubrica_id?: string | number;
  nombre?: string;
  descripcion?: string;
  peso_porcentual?: number;
  weight_percentage?: number;
  orden?: number;
};

/** Id de la rúbrica asociada al criterio. */
export function getCriterionRubricId(criterion: CriterionLike): string | null {
  const raw =
    criterion.rubric_id ??
    criterion.rubricId ??
    criterion.rubrica_id ??
    (criterion as { rubric?: { id?: string | number } }).rubric?.id;

  if (raw == null || raw === '') return null;
  return String(raw);
}

/** Normaliza el peso del criterio desde distintos nombres de campo del API. */
export function getCriterionWeight(criterion: CriterionLike): number {
  const raw =
    criterion.weight ??
    criterion.peso_porcentual ??
    criterion.weight_percentage;

  const value = Number(raw ?? 0);
  if (Number.isNaN(value)) return 0;

  if (value > 0 && value <= 1) {
    return Math.round(value * 100);
  }

  return value;
}

/** Unifica un criterio crudo del backend al modelo del frontend. */
export function normalizeCriterion(raw: CriterionLike): Criterion {
  const rubricId = getCriterionRubricId(raw);
  const weight = getCriterionWeight(raw);

  return {
    id: raw.id != null ? String(raw.id) : undefined,
    rubric_id: rubricId ?? undefined,
    name: String(raw.name ?? raw.nombre ?? '').trim(),
    description: String(raw.description ?? raw.descripcion ?? '').trim(),
    weight,
    order: raw.order ?? raw.orden,
  };
}

/** Convierte la respuesta del API en un arreglo de criterios. */
export function ensureCriteriaList(data: unknown): CriterionLike[] {
  if (Array.isArray(data)) return data as CriterionLike[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['criteria', 'criterios', 'items', 'results', 'data']) {
      const nested = obj[key];
      if (Array.isArray(nested)) return nested as CriterionLike[];
    }
  }
  return [];
}

/** Filtra criterios por id de rúbrica (comparación flexible). */
export function filterCriteriaByRubricId(
  criteria: Criterion[],
  rubricId: string
): Criterion[] {
  const target = String(rubricId);
  return criteria.filter((c) => getCriterionRubricId(c) === target);
}
