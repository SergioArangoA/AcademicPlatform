import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { Teacher } from '../models/Teachers/Teacher';
import { teacherService } from '../services/teacherService';
import { getAuthUserId } from './authUser';

type AuthUser = FirebaseUser | AppUser | null;

/** Misma estrategia que /admin/assign-teacher: mapa teachers.id + user_id + identification */
function buildTeacherLookup(teachers: Teacher[]): Map<string, Teacher> {
  const map = new Map<string, Teacher>();

  teachers.forEach((teacher) => {
    map.set(String(teacher.id), teacher);
    if (teacher.user_id) map.set(String(teacher.user_id), teacher);
    if (teacher.identification) map.set(String(teacher.identification), teacher);
  });

  return map;
}

/**
 * Obtiene el registro en tabla `teachers` del usuario autenticado.
 * group.teacher_id siempre referencia teachers.id (como en assign-teacher).
 */
export async function resolveTeacherRecord(user: AuthUser): Promise<Teacher | null> {
  const authUserId = getAuthUserId(user);
  if (!authUserId && !user) return null;

  const teachers = await teacherService.searchTeacher('');
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
    teachers.find(
      (t) =>
        candidates.some((c) => String(t.user_id) === c || String(t.id) === c)
    ) ?? null
  );
}

/** Id de teachers.id para comparar con group.teacher_id */
export async function resolveTeacherId(user: AuthUser): Promise<string> {
  const teacher = await resolveTeacherRecord(user);
  return teacher ? String(teacher.id) : getAuthUserId(user);
}
