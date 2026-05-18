/**
 * Saco el id del usuario logueado (Firebase o modelo User) para resolver docente/estudiante en el backend.
 */
import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';

type AuthUser = FirebaseUser | AppUser | null;

/** ID del usuario en el backend (docente, estudiante, etc.). */
export function getAuthUserId(user: AuthUser): string {
  if (!user) return '';
  const u = user as AppUser & FirebaseUser;
  return String(u.user_id ?? u.id ?? '').trim();
}
