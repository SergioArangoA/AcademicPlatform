/**
 * Evaluaciones — contrato Postman `Evaluations`:
 * POST   /api/evaluation/evaluations
 * GET    /api/evaluation/evaluations
 * GET    /api/evaluation/evaluations/:id
 * PUT    /api/evaluation/evaluations/:id  — incluye rubric_id para asociar rúbrica (CU-10)
 * GET    /api/evaluation/evaluations/search?name=...
 */
import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Evaluation } from "../models/Evaluation/Evaluation";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/evaluations";

/** Body de POST Create Evaluation (sin rubric_id). */
export interface CreateEvaluationPayload {
    subject_id: string;
    group_id: string;
    name: string;
    description: string;
    weight: number;
}

/** Body de PUT Update Evaluation (incluye rubric_id opcional). */
export interface UpdateEvaluationPayload {
    subject_id?: string;
    group_id?: string;
    rubric_id?: string | null;
    name?: string;
    description?: string;
    weight?: number;
}

class EvaluationService {
    async getEvaluations(groupId?: string): Promise<Evaluation[]> {
        try {
            const response = await api.get<ApiEnvelope<Evaluation[]>>(API_URL);
            const list = unwrapApiData(response);
            const arr = Array.isArray(list) ? list : [];
            if (groupId) {
                return arr.filter((e) => String(e.group_id) === String(groupId));
            }
            return arr;
        } catch (error) {
            console.error("Error al obtener evaluaciones:", error);
            return [];
        }
    }

    async searchEvaluations(filters: { name?: string }): Promise<Evaluation[]> {
        try {
            const response = await api.get<ApiEnvelope<Evaluation[]>>(
                `${API_URL}/search`,
                { params: filters }
            );
            const list = unwrapApiData(response);
            return Array.isArray(list) ? list : [];
        } catch (error) {
            console.error("Error al buscar evaluaciones:", error);
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

    async createEvaluation(payload: CreateEvaluationPayload): Promise<Evaluation> {
        const response = await api.post<ApiEnvelope<Evaluation>>(API_URL, payload);
        return unwrapApiData(response);
    }

    async updateEvaluation(
        evaluationId: string,
        payload: UpdateEvaluationPayload
    ): Promise<Evaluation> {
        const response = await api.put<ApiEnvelope<Evaluation>>(
            `${API_URL}/${evaluationId}`,
            payload
        );
        return unwrapApiData(response);
    }

    async deleteEvaluation(evaluationId: string): Promise<void> {
        await api.delete(`${API_URL}/${evaluationId}`);
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

