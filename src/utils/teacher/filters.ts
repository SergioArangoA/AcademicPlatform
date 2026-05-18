/**
 * Filtros para grupos y rúbricas del docente.
 * Rúbricas: por asignatura (subject_id), no por docente — cualquier profe de la misma asignatura las ve.
 */
import { Group } from '../../models/Groups/Group';
import { Rubric } from '../../models/Evaluation/Rubric';
import {
    collectRubricIdsForTeacherSubjects,
    enrichRubricWithOwnership,
} from '../rubricOwnershipStorage';

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

type RubricWithTeacherRef = Rubric & {
  teacherId?: string | number | null;
  teacher?: { id?: string | number | null };
};

export function getRubricTeacherId(rubric: Rubric): string | null {
  const r = rubric as RubricWithTeacherRef;
  const raw = rubric.teacher_id ?? r.teacherId ?? r.teacher?.id;
  if (raw == null || raw === '') return null;
  return String(raw);
}

export function getRubricSubjectId(rubric: Rubric): string | null {
  if (rubric.subject_id == null || rubric.subject_id === '') return null;
  return String(rubric.subject_id);
}

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

export type RubricFilterOptions = {
  publicOnly?: boolean;
  evaluations?: Array<{ rubric_id?: string | null; subject_id?: string | number | null }>;
};

/**
 * Rúbricas de las asignaturas que imparte el docente (grupos asignados).
 * Incluye rúbricas creadas por otros docentes de la misma asignatura.
 */
export function filterRubricsForTeacher<T extends Rubric>(
  rubrics: T[],
  _teacherMatchIds: Set<string>,
  subjectIds: Set<string>,
  options?: RubricFilterOptions
): T[] {
  if (subjectIds.size === 0) return [];

  const linkedIds = collectRubricIdsForTeacherSubjects(subjectIds, options?.evaluations);

  return rubrics
    .map((rubric) => enrichRubricWithOwnership(rubric))
    .filter((rubric) => {
      const rubricId = rubric.id != null ? String(rubric.id) : '';
      if (!rubricId || !linkedIds.has(rubricId)) return false;
      if (options?.publicOnly && !rubric.is_public) return false;
      return true;
    });
}

/** @deprecated Usar filterGroupsByTeacherMatchIds con resolveTeacherMatchIds */
export function filterGroupsAssignedToTeacher<T extends Group>(
  groups: T[],
  matchIds: Set<string>
): T[] {
  return filterGroupsByTeacherMatchIds(groups, matchIds);
}

/** @deprecated Usar filterRubricsByTeacherMatchIds con resolveTeacherMatchIds */
export function filterRubricsAssignedToTeacher<T extends Rubric>(
  rubrics: T[],
  matchIds: Set<string>
): T[] {
  return filterRubricsByTeacherMatchIds(rubrics, matchIds);
}
