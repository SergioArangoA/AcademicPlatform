/**
 * Opciones de asignatura/grupo para selects del docente (crear rúbrica, notas finales, etc.).
 */
import { Subject } from '../../models/Subjects/Subject';
import { SubjectGroupOption } from '../../models/Subjects/SubjectGroupOption';
import { groupService } from '../../services/groupService';
import { subjectService } from '../../services/subjectService';
import { filterGroupsByTeacherMatchIds } from './filters';
import { resolveTeacherMatchIds, resolveTeacherRecord } from './resolveTeacherId';
import type { AuthUser } from './types';

export async function loadTeacherGroupOptions(user: AuthUser): Promise<SubjectGroupOption[]> {
  const teacher = await resolveTeacherRecord(user);
  const matchIds = resolveTeacherMatchIds(user, teacher);
  if (matchIds.size === 0) return [];

  const [groups, subjects] = await Promise.all([
    groupService.getGroups(),
    subjectService.getSubjects(),
  ]);

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((subject) => {
    if (subject.id !== undefined && subject.id !== null) {
      subjectMap.set(String(subject.id), subject);
    }
    if (subject.code) {
      subjectMap.set(subject.code, subject);
    }
  });

  const assignedGroups = filterGroupsByTeacherMatchIds(groups, matchIds);

  return assignedGroups.map((group) => {
    const subjectKey = group.subject_id ? String(group.subject_id) : '';
    const subject = subjectKey ? subjectMap.get(subjectKey) : undefined;
    const groupName = group.name ?? group.group_code ?? 'Grupo';
    const subjectName = subject?.name ?? 'Asignatura';
    const subjectCode = subject?.code ?? '';

    return {
      group_id: String(group.id),
      subject_id: String(subject?.id ?? group.subject_id ?? ''),
      subjectName,
      subjectCode,
      groupName,
      label: `${subjectName} (${subjectCode || '—'}) – ${groupName}`,
    };
  });
}
