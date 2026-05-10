import { UserResponse } from "./UserResponse";

export interface UserApiResponse {
  data: UserResponse;
  message?: string;
}