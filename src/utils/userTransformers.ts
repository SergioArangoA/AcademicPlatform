import { UserForList } from "../models/Users/UserForList";
import { UserResponse } from "../models/Users/UserResponse";

export const transformUsersForList = (users: UserResponse[]): UserForList[] => {
  return users.map(user => ({
    id: user.id,
    code: user.code,
    name: 'profile' in user 
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user.code, // Para ADMIN sin profile
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
  }));
};
