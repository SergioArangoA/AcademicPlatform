import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { groupService } from '../services/groupService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { Subject } from '../models/Subjects/Subject';
import { SubjectGroupOption } from '../models/Subjects/SubjectGroupOption';
import { resolveTeacherRecord } from './resolveTeacherId';

type AuthUser = FirebaseUser | AppUser | null;

/**
 * Carga grupos del docente con la misma fuente de datos que /admin/assign-teacher:
 * getGroups() + getSubjects() + searchTeacher(""), luego filtra por teachers.id === group.teacher_id.
 */
export async function loadTeacherGroupOptions(user: AuthUser): Promise<SubjectGroupOption[]> {
  const teacher = await resolveTeacherRecord(user);
  if (!teacher) return [];

  const teacherRecordId = String(teacher.id);

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

  const assignedGroups = groups.filter(
    (group) => group.teacher_id && String(group.teacher_id) === teacherRecordId
  );

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
