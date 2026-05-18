/**
 * API de rúbricas para el flujo del docente (crear, listar, publicar).
 * POST solo envía title, description, is_public, is_archived; los criterios van aparte en criterionService.
 */
import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Rubric } from "../models/Evaluation/Rubric";
import { Criterion } from "../models/Evaluation/Criterion";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/rubrics";
const CRITERIA_URL = "/evaluation/criteria";

/** Payload de POST /evaluation/rubrics (sin subject_id: el backend no lo persiste). */
export interface CreateRubricPayload {
    title: string;
    description: string;
    is_public: boolean;
    is_archived: boolean;
}

export interface CreateCriterionPayload {
    name: string;
    description: string;
    weight: number;
    rubric_id: string;
}

class RubricService {
    async getRubrics(isPublic?: boolean): Promise<Rubric[]> {
        try {
            const response = await api.get<ApiEnvelope<Rubric[]>>(API_URL);
            let list = unwrapApiData(response);
            if (!Array.isArray(list)) list = [];
            if (isPublic === true) list = list.filter((r) => r.is_public === true);
            if (isPublic === false) list = list.filter((r) => !r.is_public);
            return list;
        } catch (error) {
            console.error("Error al obtener rúbricas:", error);
            return [];
        }
    }

    async getPublicRubrics(): Promise<Rubric[]> {
        return this.getRubrics(true);
    }

    async getRubricById(id: string): Promise<Rubric | null> {
        try {
            const response = await api.get<ApiEnvelope<Rubric>>(`${API_URL}/${id}`);
            return unwrapApiData(response);
        } catch (error) {
            console.error("Rúbrica no encontrada:", error);
            return null;
        }
    }

    async createRubric(payload: CreateRubricPayload): Promise<Rubric> {
        const response = await api.post<ApiEnvelope<Rubric>>(API_URL, payload);
        return unwrapApiData(response);
    }

    async updateRubric(rubricId: string, payload: Partial<CreateRubricPayload>): Promise<Rubric> {
        const response = await api.put<ApiEnvelope<Rubric>>(`${API_URL}/${rubricId}`, payload);
        return unwrapApiData(response);
    }

    async createCriterion(payload: CreateCriterionPayload): Promise<Criterion> {
        const response = await api.post<ApiEnvelope<Criterion>>(CRITERIA_URL, payload);
        return unwrapApiData(response);
    }

    async publishRubric(rubricId: string): Promise<Rubric> {
        const response = await api.patch<ApiEnvelope<Rubric>>(`${API_URL}/${rubricId}/publish`);
        return unwrapApiData(response);
    }

    async saveRubricWithCriteria(
        rubricPayload: CreateRubricPayload,
        criteria: Omit<CreateCriterionPayload, "rubric_id">[]
    ): Promise<Rubric> {
        const rubric = await this.createRubric({
            ...rubricPayload,
            is_public: false,
        });

        const rubricId = String(rubric.id);
        if (!rubricId || rubricId === "undefined") {
            throw new Error("El servidor no devolvió el id de la rúbrica creada.");
        }

        for (const criterion of criteria) {
            if (!criterion.name.trim()) continue;
            await this.createCriterion({
                rubric_id: rubricId,
                name: criterion.name.trim(),
                description: criterion.description.trim(),
                weight: criterion.weight,
            });
        }

        return rubric;
    }
}

export function getRubricErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string; error?: string } | undefined;
        return data?.message ?? data?.error ?? error.message;
    }
    if (error instanceof Error) return error.message;
    return "Error desconocido al guardar la rúbrica.";
}

export const rubricService = new RubricService();
