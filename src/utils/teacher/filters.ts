/**
 * Filtros para grupos y rúbricas del docente (datos del API, sin localStorage).
 */
import { Group } from '../../models/Groups/Group';
import { Rubric } from '../../models/Evaluation/Rubric';

export type { RubricFilterOptions } from './rubricFilters';
export {
    filterRubricsForTeacher,
    filterRubricsVisibleToTeacher,
    filterRubricsWithoutEvaluation,
    collectRubricIdsFromTeacherEvaluations,
    collectAllLinkedRubricIds,
    collectRubricIdsFromEvaluations,
    buildRubricSubjectLabelMap,
    buildRubricSubjectIdMap,
    ensureRubricsLoaded,
    mergeRubricsFromTeacherEvaluations,
} from './rubricFilters';
export type { RubricVisibility, RubricWithVisibility } from './rubricFilters';

type GroupWithTeacherRef = Group & {
  teacherId?: string | number | null;
  teacher?: { id?: string | number | null };
};

export function getGroupTeacherId(group: Group): string | null {
  const g = group as GroupWithTeacherRef;
  const raw = group.teacher_id ?? g.teacherId ?? g.teacher?.id;
  if (raw == null || raw === '') return null;
  return String(raw);
}

export function filterGroupsByTeacherMatchIds<T extends Group>(
  groups: T[],
  matchIds: Set<string>
): T[] {
  if (matchIds.size === 0) return [];
  return groups.filter((group) => {
    const assignedId = getGroupTeacherId(group);
    return assignedId != null && matchIds.has(assignedId);
  });
}

/** @deprecated Rubric no tiene teacher_id en el API. */
export function getRubricTeacherId(_rubric: Rubric): string | null {
  return null;
}

/** @deprecated La asignatura no viene en Rubric; usar evaluación → grupo. */
export function getRubricSubjectId(_rubric: Rubric): string | null {
  return null;
}

/** @deprecated El API no expone teacher_id en rubrics; usar filterRubricsForTeacher */
export function filterRubricsByTeacherMatchIds<T extends Rubric>(
  rubrics: T[],
  matchIds: Set<string>
): T[] {
  if (matchIds.size === 0) return [];
  return rubrics.filter((rubric) => {
    const assignedId = getRubricTeacherId(rubric);
    return assignedId != null && matchIds.has(assignedId);
  });
}

/** @deprecated Usar filterGroupsByTeacherMatchIds */
export function filterGroupsAssignedToTeacher<T extends Group>(
  groups: T[],
  matchIds: Set<string>
): T[] {
  return filterGroupsByTeacherMatchIds(groups, matchIds);
}

/** @deprecated Usar filterRubricsForTeacher */
export function filterRubricsAssignedToTeacher<T extends Rubric>(
  rubrics: T[],
  matchIds: Set<string>
): T[] {
  return filterRubricsByTeacherMatchIds(rubrics, matchIds);
}
