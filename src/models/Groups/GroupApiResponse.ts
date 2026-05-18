import { Group } from "./Group";

/** Respuesta del API al crear, editar o ver un solo grupo */
export interface GroupApiResponse{
    data: Group;
    message?: string;
}