import { UserForList } from "../models/Users/UserForList";
import { UserResponse } from "../models/Users/UserResponse";

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
      profile,
    };
  });
};
