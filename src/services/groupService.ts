import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Group } from "../models/Groups/Group";
import { GroupsApiResponse } from "../models/Groups/GroupsApiResponse";
import { GroupApiResponse } from "../models/Groups/GroupApiResponse";
import { GroupPayload } from "../models/Groups/GroupPayload";

const API_URL = "/academic/groups";

class GroupService {
    async getGroups(): Promise<Group[]> {
        try {
            const response = await api.get<GroupsApiResponse>(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }

    async getGroupById(id: number): Promise<Group | null> {
        try {
            const response = await api.get<GroupApiResponse>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Grupo no encontrado:", error);
            return null;
        }
    }

    async searchGroup(name?: string, semester_id?: string): Promise<Group[]> {
        try {
            const response = await api.get<GroupsApiResponse>(`${API_URL}/search`, {
                params: {
                    name,
                    semester_id,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error("Error al buscar grupos:", error);
            return [];
        }
    }

    async createGroup(payload: GroupPayload): Promise<Group | null> {
        try {
            const response = await api.post<GroupApiResponse>(API_URL, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al crear grupo:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al crear grupo:", error);
            }
            return null;
        }
    }

    async updateGroup(groupId: string, payload: GroupPayload): Promise<Group | null> {
        try {
            const response = await api.put<GroupApiResponse>(`${API_URL}${groupId}`, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al actualizar Plan de Estudio:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al actualizar Plan de Estudio:", error);
            }
            return null;
        }
    }

    async assignTeacherToGroup(groupId: string, teacherId: string): Promise<boolean> {
        try {
            await api.patch(`${API_URL}/${groupId}/assign-teacher/${teacherId}`);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al asignar docente al grupo:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al asignar docente al grupo:", error);
            }
            return false;
        }
    }

    async deleteGroup(id: number | string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar materia:", error);
            return false;
        }
    }

    

}

// Exportamos una instancia de la clase para reutilizarla
export const groupService = new GroupService();