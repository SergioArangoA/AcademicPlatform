/**
 * Paso del usuario de login al registro Teacher del backend.
 * Sin esto las pantallas del docente no saben qué grupos, estudiantes o rúbricas son míos.
 */
import { User as AppUser } from '../../models/User';
import { Teacher } from '../../models/Teachers/Teacher';
import { teacherService } from '../../services/teacherService';
import { getAuthUserId } from '../authUser';
import type { AuthUser } from './types';

function buildTeacherLookup(teachers: Teacher[]): Map<string, Teacher> {
  const map = new Map<string, Teacher>();

  teachers.forEach((teacher) => {
    map.set(String(teacher.id), teacher);
    if (teacher.user_id) map.set(String(teacher.user_id), teacher);
    if (teacher.identification) map.set(String(teacher.identification), teacher);
  });

  return map;
}

/** Registro en tabla `teachers` del usuario autenticado (teachers.id en group.teacher_id) */
export async function resolveTeacherRecord(user: AuthUser): Promise<Teacher | null> {
  const authUserId = getAuthUserId(user);
  if (!authUserId && !user) return null;

  const teachersRaw = await teacherService.searchTeacher('');
  const teachers = Array.isArray(teachersRaw) ? teachersRaw : [];
  const lookup = buildTeacherLookup(teachers);
  const u = user as AppUser;

  const candidates = [
    authUserId,
    u?.user_id ? String(u.user_id) : '',
    u?.id ? String(u.id) : '',
    u?.identification ? String(u.identification) : '',
    u?.code ? String(u.code) : '',
  ].filter(Boolean);

  for (const key of candidates) {
    const teacher = lookup.get(key);
    if (teacher) return teacher;
  }

  return (
    teachers.find((t) =>
      candidates.some((c) => String(t.user_id) === c || String(t.id) === c)
    ) ?? null
  );
}

export async function resolveTeacherId(user: AuthUser): Promise<string> {
  const teacher = await resolveTeacherRecord(user);
  return teacher ? String(teacher.id) : getAuthUserId(user);
}
