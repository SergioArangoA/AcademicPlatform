import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Evaluation } from "../models/Evaluation/Evaluation";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/evaluations";

class EvaluationService {
    async getEvaluations(): Promise<Evaluation[]> {
        try {
            const response = await api.get<ApiEnvelope<Evaluation[]>>(API_URL);
            const list = unwrapApiData(response);
            return Array.isArray(list) ? list : [];
        } catch (error) {
            console.error("Error al obtener evaluaciones:", error);
            return [];
        }
    }

    async getEvaluationById(id: string): Promise<Evaluation | null> {
        try {
            const response = await api.get<ApiEnvelope<Evaluation>>(`${API_URL}/${id}`);
            return unwrapApiData(response);
        } catch (error) {
            console.error("Evaluación no encontrada:", error);
            return null;
        }
    }

    async associateRubric(evaluationId: string, rubricId: string): Promise<Evaluation> {
        const response = await api.patch<ApiEnvelope<Evaluation>>(
            `${API_URL}/${evaluationId}/associate-rubric/${rubricId}`
        );
        return unwrapApiData(response);
    }
}

export function getEvaluationErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        return data?.message ?? error.message;
    }
    if (error instanceof Error) return error.message;
    return "Error al asociar la rúbrica.";
}

export const evaluationService = new EvaluationService();
