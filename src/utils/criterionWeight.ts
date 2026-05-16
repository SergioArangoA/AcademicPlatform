import { Criterion } from '../models/Criterion';

type CriterionLike = Criterion & {
  peso_porcentual?: number;
  weight_percentage?: number;
};

/** Normaliza el peso del criterio desde distintos nombres de campo del API. */
export function getCriterionWeight(criterion: CriterionLike): number {
  const raw =
    criterion.weight ??
    criterion.peso_porcentual ??
    criterion.weight_percentage;

  const value = Number(raw ?? 0);
  if (Number.isNaN(value)) return 0;

  // Algunos APIs guardan 0.3 en lugar de 30
  if (value > 0 && value <= 1) {
    return Math.round(value * 100);
  }

  return value;
}
