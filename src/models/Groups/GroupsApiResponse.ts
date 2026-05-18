import { Group } from "./Group";

/** Respuesta del API cuando pido la lista de grupos */
export interface GroupsApiResponse{
    data: Group[];
    message?: string;
}