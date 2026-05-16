import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Scale } from "../models/Scale";

const API_URL = "/evaluation/scales";

class ScaleService {
    async getScales(): Promise<Scale[]> {
        try {
            const response = await api.get<Scale[]>(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener escalas:", error);
            return [];
        }
    }

    async getScaleById(id: string): Promise<Scale | null> {
        try {
            const response = await api.get<Scale>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Escala no encontrada:", error);
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
export const scaleService = new ScaleService();
