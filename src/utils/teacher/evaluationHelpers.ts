/**
 * Helpers del flujo de evaluaciones del docente (asociar rúbrica, asignaturas, etc.).
 */
import { Subject } from '../../models/Subjects/Subject';
import { subjectService } from '../../services/subjectService';
import { loadTeacherGroupOptions } from './groupOptions';
import { resolveVerifiedTeacherId } from './resolveTeacherId';
import type { AuthUser, TeacherSubjectOption } from './types';

export async function loadTeacherSubjects(user: AuthUser): Promise<TeacherSubjectOption[]> {
  const options = await loadTeacherGroupOptions(user);
  const map = new Map<string, TeacherSubjectOption>();
  options.forEach((o) => {
    if (!o.subject_id) return;
    map.set(String(o.subject_id), {
      id: String(o.subject_id),
      code: o.subjectCode || '—',
      name: o.subjectName || 'Asignatura',
      label: `${o.subjectCode || '—'} — ${o.subjectName || 'Asignatura'}`,
    });
  });
  return Array.from(map.values());
}

export async function resolveTeacherIdForApi(user: AuthUser): Promise<string | null> {
  const verified = await resolveVerifiedTeacherId(user);
  return verified ?? null;
}

export async function getSubjectByIdSafe(id?: string | number | null): Promise<Subject | null> {
  if (id == null || id === '') return null;
  return subjectService.getSubjectById(id);
}
