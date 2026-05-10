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

    async associateRubric(evaluationId: string, rubricId: string): Promise<any> {
        try {
            const response = await api.patch(`${API_URL}/${evaluationId}/associate-rubric/${rubricId}`);
            return response.data;
        } catch (error) {
            console.error("Error al asociar rúbrica:", error);
            throw error;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const evaluationService = new EvaluationService();