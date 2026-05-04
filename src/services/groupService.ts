import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Group } from "../models/Group";

const API_URL = "/academic/groups";

class GroupService {
    async getGroups(): Promise<Group[]> {
        try {
            const response = await api.get<Group[]>(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }

    async getGroupById(id: number): Promise<Group | null> {
        try {
            const response = await api.get<Group>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Grupo no encontrado:", error);
            return null;
        }
    }

    async createUser(user: Omit<User, "id">): Promise<User | null> {
        try {
            const response = await axios.post<User>(API_URL, user);
            return response.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return null;
        }
    }

    async updateUser(id: number, user: Partial<User>): Promise<User | null> {
        try {
            const response = await axios.put<User>(`${API_URL}/${id}`, user);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            return null;
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return false;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const groupService = new GroupService();