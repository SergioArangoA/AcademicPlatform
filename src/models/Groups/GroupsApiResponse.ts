import { Group } from "./Group";

export interface GroupsApiResponse{
    data: Group[];
    message?: string;
}