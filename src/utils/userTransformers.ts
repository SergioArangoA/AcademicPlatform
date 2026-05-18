import { UserForList } from "../models/Users/UserForList";
import { UserResponse } from "../models/Users/UserResponse";

/**
 * Inscripciones usan students.id (profile.id), no users.id.
 * Indexamos por ambos para resolver nombre, código y correo.
 */
export function buildStudentLookupMap(students: UserForList[]): Map<string, UserForList> {
  const map = new Map<string, UserForList>();
  for (const student of students) {
    map.set(String(student.id), student);
    if (student.profile?.id) map.set(String(student.profile.id), student);
    if (student.profile?.user_id) map.set(String(student.profile.user_id), student);
    if (student.registration_id) map.set(String(student.registration_id), student);
  }
  return map;
}

export function resolveStudentFromEnrollment(
  lookup: Map<string, UserForList>,
  enrollmentStudentId: string
): UserForList | undefined {
  return lookup.get(String(enrollmentStudentId));
}

export const transformUsersForList = (users: UserResponse[]): UserForList[] => {
  return users.map(user => {
    const profile = user.profile;

    return {
      id: user.id,
      code: user.code,
      name: profile
        ? `${profile.first_name} ${profile.last_name}`
        : user.code, // Para ADMIN sin profile
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      registration_id: user.registration_id ?? profile?.registrationId ?? null,
      profile,
    };
  });
};
