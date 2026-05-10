import { UserResponse } from "./UserResponse";

export interface UsersApiResponse {
    data: UserResponse[];
    message?: string;
}