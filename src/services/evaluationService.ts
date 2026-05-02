import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Evaluation } from "../models/Evaluation";

const API_URL = "/evaluation";

class EvaluationService {
    async getEvaluations(): Promise<Evaluation[]> {
        try {
            const response = await api.get<Evaluation[]>(`${API_URL}/evaluations`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener evaluaciones:", error);
            return [];
        }
    }

    async getUserById(id: number): Promise<User | null> {
        try {
            const response = await axios.get<User>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Usuario no encontrado:", error);
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
export const evaluationService = new EvaluationService();