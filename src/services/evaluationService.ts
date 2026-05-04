import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Evaluation } from "../models/Evaluation";

const API_URL = "/evaluation/evaluations";

class EvaluationService {
    async getEvaluations(): Promise<Evaluation[]> {
        try {
            const response = await api.get<Evaluation[]>(`${API_URL}`);
            console.log("EVALUATIONS:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener evaluaciones:", error);
            return [];
        }
    }

    async getEvaluationById(id: number): Promise<Evaluation | null> {
        try {
            const response = await api.get<Evaluation>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Evaluación no encontrada:", error);
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