import { Teacher } from "./Teacher";

export interface TeachersApiResponse {
    data: Teacher[];
    message?: string;
}
