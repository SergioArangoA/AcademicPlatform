/**
 * Paso del usuario de login al registro Teacher del backend.
 * group.teacher_id y rubric.teacher_id usan profile.id (teachers.id), no users.id.
 */
import { User as AppUser } from '../../models/User';
import { Teacher } from '../../models/Teachers/Teacher';
import { teacherService } from '../../services/teacherService';
import { getAuthUserId, getTeacherProfileId } from '../authUser';
import type { AuthUser } from './types';

type TeacherLike = Teacher & {
  profile?: { id?: string; user_id?: string; identification?: string };
};

/** teachers.id o profile.id según venga el API */
export function getTeacherEntityId(teacher: TeacherLike): string {
  if (teacher.profile?.id != null && teacher.profile.id !== '') {
    return String(teacher.profile.id);
  }
  return String(teacher.id);
}

function buildTeacherLookup(teachers: TeacherLike[]): Map<string, TeacherLike> {
  const map = new Map<string, TeacherLike>();

  teachers.forEach((teacher) => {
    const entityId = getTeacherEntityId(teacher);
    map.set(entityId, teacher);
    map.set(String(teacher.id), teacher);
    if (teacher.user_id) map.set(String(teacher.user_id), teacher);
    if (teacher.profile?.id) map.set(String(teacher.profile.id), teacher);
    if (teacher.profile?.user_id) map.set(String(teacher.profile.user_id), teacher);
    if (teacher.identification) map.set(String(teacher.identification), teacher);
    if (teacher.profile?.identification) {
      map.set(String(teacher.profile.identification), teacher);
    }
  });

  return map;
}

/** IDs con los que comparar group.teacher_id / rubric.teacher_id */
export function resolveTeacherMatchIds(
  user: AuthUser,
  teacher: TeacherLike | null | undefined
): Set<string> {
  const ids = new Set<string>();

  const profileId = getTeacherProfileId(user);
  if (profileId) ids.add(profileId);

  if (teacher) {
    ids.add(getTeacherEntityId(teacher));
    if (teacher.user_id) ids.add(String(teacher.user_id));
    if (teacher.profile?.user_id) ids.add(String(teacher.profile.user_id));
  }

  return ids;
}

/** Registro Teacher del usuario autenticado (siempre consulta el API). */
export async function resolveTeacherRecord(user: AuthUser): Promise<TeacherLike | null> {
  const authUserId = getAuthUserId(user);
  if (!authUserId && !user) return null;

  const teachersRaw = await teacherService.searchTeacher('');
  const teachers = (Array.isArray(teachersRaw) ? teachersRaw : []) as TeacherLike[];
  const lookup = buildTeacherLookup(teachers);
  const u = user as AppUser;

  const profileId = getTeacherProfileId(user);
  const candidates = [
    profileId ?? '',
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
      candidates.some(
        (c) =>
          String(t.user_id) === c ||
          String(t.id) === c ||
          String(t.profile?.id) === c ||
          String(getTeacherEntityId(t)) === c
      )
    ) ?? null
  );
}

/** profile.id para API y filtros (prioridad sobre users.id) */
export async function resolveTeacherId(user: AuthUser): Promise<string> {
  const verified = await resolveVerifiedTeacherId(user);
  if (verified) return verified;

  const profileId = getTeacherProfileId(user);
  if (profileId) return profileId;

  return getAuthUserId(user);
}

/** teachers.id confirmado en BD — usar al crear rúbricas (FK). */
export async function resolveVerifiedTeacherId(user: AuthUser): Promise<string | undefined> {
  const teacher = await resolveTeacherRecord(user);
  if (!teacher) return undefined;
  const entityId = getTeacherEntityId(teacher);
  return entityId || undefined;
}

export function getResolvedTeacherProfileId(
  user: AuthUser,
  teacher: TeacherLike | null | undefined
): string | null {
  return getTeacherProfileId(user) ?? (teacher ? getTeacherEntityId(teacher) : null);
}
