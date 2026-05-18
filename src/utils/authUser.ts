/**
 * Saco ids del usuario logueado (Firebase o modelo User).
 * Para docente: group.teacher_id y rubric.teacher_id usan profile.id, no users.id.
 */
import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';

type AuthUser = FirebaseUser | AppUser | null;

type UserWithProfile = AppUser & {
  profile?: { id?: string; user_id?: string };
};

/** ID de la tabla users (login / JWT) */
export function getAuthUserId(user: AuthUser): string {
  if (!user) return '';
  const u = user as AppUser & FirebaseUser;
  return String(u.user_id ?? u.id ?? '').trim();
}

/** ID del perfil académico (teachers.id / students.id) — usar para grupos, rúbricas, etc. */
export function getTeacherProfileId(user: AuthUser): string | null {
  if (!user) return null;
  const u = user as UserWithProfile;
  const profileId = u.profile?.id;
  if (profileId != null && profileId !== '') {
    return String(profileId);
  }
  return null;
}
