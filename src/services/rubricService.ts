import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Rubric } from "../models/Rubric";
import { Criterion } from "../models/Criterion";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/rubrics";
const CRITERIA_URL = "/evaluation/criteria";

/** Payload de POST /evaluation/rubrics según contrato del backend. */
export interface CreateRubricPayload {
    subject_id: string;
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
    async getRubrics(teacherId?: string, isPublic?: boolean): Promise<Rubric[]> {
        try {
            const params: Record<string, string | boolean> = {};
            if (teacherId) params.teacher_id = teacherId;
            if (isPublic !== undefined) params.is_public = isPublic;

            const response = await api.get<ApiEnvelope<Rubric[]>>(`${API_URL}`, { params });
            let list = unwrapApiData(response);

            if (!Array.isArray(list)) {
                list = [];
            }

            if (isPublic === true) {
                list = list.filter((r) => r.is_public === true);
            }

            return list;
        } catch (error) {
            console.error("Error al obtener rúbricas:", error);
            return [];
        }
    }

    async getRubricsByTeacher(teacherId: string, isPublic?: boolean): Promise<Rubric[]> {
        const list = await this.getRubrics(teacherId, isPublic);
        return list;
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

    async createCriterion(payload: CreateCriterionPayload): Promise<Criterion> {
        const response = await api.post<ApiEnvelope<Criterion>>(CRITERIA_URL, payload);
        return unwrapApiData(response);
    }

    async publishRubric(rubricId: string): Promise<void> {
        await api.patch(`${API_URL}/${rubricId}/publish`);
    }

    async saveRubricWithCriteria(
        rubricPayload: CreateRubricPayload,
        criteria: Omit<CreateCriterionPayload, "rubric_id">[]
    ): Promise<Rubric> {
        const rubric = await this.createRubric(rubricPayload);

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

    /** @deprecated Usar saveRubricWithCriteria */
    async createFullRubric(payload: any): Promise<Rubric | null> {
        try {
            const criteria = (payload.criteria ?? []).map((c: any) => ({
                name: c.name,
                description: c.description ?? "",
                weight: Number(c.weight ?? 0),
            }));

            const isPublic = Boolean(payload.is_public);

            return await this.saveRubricWithCriteria(
                {
                    subject_id: String(payload.subject_id),
                    title: payload.title,
                    description: payload.description ?? "",
                    is_public: isPublic,
                    is_archived: false,
                },
                criteria
            );
        } catch (error) {
            console.error("Error al crear la rúbrica completa:", error);
            throw error;
        }
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
