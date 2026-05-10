import { Semester } from "./Semester";

export interface SemestersApiResponse{
    data: Semester[];
    message?: string;
}