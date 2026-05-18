import { Rubric } from '../models/Evaluation/Rubric';

export const RUBRIC_EDIT_BLOCKED_MESSAGE =
    'Las rúbricas publicadas no se pueden editar. Solo puedes consultarlas.';

/** CU-08: publicadas no editables; archivadas sí (aunque estén publicadas). */
export function isRubricEditable(
    rubric: Pick<Rubric, 'is_public' | 'is_archived'> | null | undefined
): boolean {
    if (!rubric) return false;
    if (rubric.is_archived === true) return true;
    return rubric.is_public !== true;
}

export function assertRubricEditable(
    rubric: Pick<Rubric, 'is_public' | 'is_archived'> | null | undefined
): void {
    if (!isRubricEditable(rubric)) {
        throw new Error(RUBRIC_EDIT_BLOCKED_MESSAGE);
    }
}
