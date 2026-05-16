import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Evaluation } from "../models/Evaluation/Evaluation";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/evaluations";

export interface UpdateEvaluationAssociationPayload {
    rubric_id: string;
    subject_id: string;
}

class EvaluationService {
    async getEvaluations(groupId?: string): Promise<Evaluation[]> {
        try {
            const response = await api.get<ApiEnvelope<Evaluation[]>>(API_URL, {
                params: groupId ? { group_id: groupId } : undefined,
            });
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

    /** CU-10: asociar rúbrica y asignatura (PATCH cuerpo o fallback associate-rubric). */
    async updateEvaluationAssociation(
        evaluationId: string,
        payload: UpdateEvaluationAssociationPayload
    ): Promise<Evaluation> {
        try {
            const response = await api.patch<ApiEnvelope<Evaluation>>(
                `${API_URL}/${evaluationId}`,
                {
                    rubric_id: payload.rubric_id,
                    subject_id: payload.subject_id,
                }
            );
            return unwrapApiData(response);
        } catch (error) {
            const updated = await this.associateRubric(evaluationId, payload.rubric_id);
            return { ...updated, subject_id: payload.subject_id };
        }
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
