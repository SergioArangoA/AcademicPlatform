/**
 * Filtros para mostrar solo grupos y rúbricas asignados al docente logueado.
 */
import { Group } from '../../models/Groups/Group';
import { Rubric } from '../../models/Evaluation/Rubric';
import { Teacher } from '../../models/Teachers/Teacher';

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

export function isGroupAssignedToTeacher(group: Group, teacher: Teacher): boolean {
  const assignedId = getGroupTeacherId(group);
  if (!assignedId) return false;

  const teacherRecordId = String(teacher.id);
  if (assignedId === teacherRecordId) return true;
  if (teacher.user_id && assignedId === String(teacher.user_id)) return true;

  return false;
}

export function filterGroupsAssignedToTeacher<T extends Group>(
  groups: T[],
  teacher: Teacher | null | undefined
): T[] {
  if (!teacher?.id) return [];
  return groups.filter((group) => isGroupAssignedToTeacher(group, teacher));
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

export function isRubricAssignedToTeacher(rubric: Rubric, teacher: Teacher): boolean {
  const assignedId = getRubricTeacherId(rubric);
  if (!assignedId) return false;

  const teacherRecordId = String(teacher.id);
  if (assignedId === teacherRecordId) return true;
  if (teacher.user_id && assignedId === String(teacher.user_id)) return true;

  return false;
}

export function filterRubricsAssignedToTeacher<T extends Rubric>(
  rubrics: T[],
  teacher: Teacher | null | undefined
): T[] {
  if (!teacher?.id) return [];
  return rubrics.filter((rubric) => isRubricAssignedToTeacher(rubric, teacher));
}
