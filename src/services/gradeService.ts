import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Grade } from "../models/Grade";

const API_URL = "/evaluation/grades";

class GradeService {
    async getGrades(): Promise<Grade[]> {
        try {
            const response = await api.get<Grade[]>(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener notas:", error);
            return [];
        }
    }

    async getGradeById(id: string): Promise<Grade | null> {
        try {
            const response = await api.get<Grade>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Nota no encontrada:", error);
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
export const gradeService = new GradeService();