/**
 * API de rúbricas (CU-08). El backend solo acepta title, description, is_public, is_archived.
 * subject_id del formulario se indexa en localStorage por asignatura (cualquier docente de esa asignatura la ve).
 */
import { api } from "../interceptors/authInterceptor";
import { Rubric } from "../models/Evaluation/Rubric";
import { ApiEnvelope } from "../types/ApiResponse";
import { getApiErrorMessage, nonEmptyText } from "../utils/apiPayload";
import { unwrapApiData } from "../utils/unwrapApiResponse";
import { criterionService } from "./criterionService";

const API_URL = "/evaluation/rubrics";

/** Datos del formulario de creación/edición */
export interface CreateRubricPayload {
    subject_id?: string | number;
    teacher_id?: string;
    title: string;
    description: string;
    is_public: boolean;
    is_archived: boolean;
}

/** Body enviado al API (columnas reales de rubrics en el backend) */
export interface CreateRubricApiBody {
    title: string;
    description: string;
    is_public: boolean;
    is_archived: boolean;
}

export interface CreateCriterionInput {
    name: string;
    description: string;
    weight: number;
}

function toCreateRubricBody(payload: CreateRubricPayload): CreateRubricApiBody {
    return {
        title: payload.title.trim(),
        description: nonEmptyText(payload.description, "Sin descripción"),
        is_public: Boolean(payload.is_public),
        is_archived: Boolean(payload.is_archived),
    };
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
        const response = await api.post<ApiEnvelope<Rubric>>(API_URL, toCreateRubricBody(payload));
        return unwrapApiData(response);
    }

    async updateRubric(rubricId: string, payload: Partial<CreateRubricApiBody>): Promise<Rubric> {
        const response = await api.put<ApiEnvelope<Rubric>>(`${API_URL}/${rubricId}`, payload);
        return unwrapApiData(response);
    }

    async publishRubric(rubricId: string): Promise<Rubric> {
        const response = await api.patch<ApiEnvelope<Rubric>>(`${API_URL}/${rubricId}/publish`);
        return unwrapApiData(response);
    }

    async saveRubricWithCriteria(
        rubricPayload: CreateRubricPayload,
        criteria: CreateCriterionInput[],
        options?: { requireCriteria?: boolean }
    ): Promise<Rubric> {
        if (!rubricPayload.title?.trim()) {
            throw new Error("El título de la rúbrica es obligatorio.");
        }

        let rubric: Rubric;
        try {
            rubric = await this.createRubric({
                ...rubricPayload,
                is_public: false,
            });
        } catch (err) {
            throw new Error(
                getApiErrorMessage(err, "Error al crear la rúbrica en el servidor.")
            );
        }

        const rubricId = String(
            rubric.id ??
                (rubric as { rubric_id?: string }).rubric_id ??
                ""
        );
        if (!rubricId || rubricId === "undefined") {
            throw new Error("El servidor no devolvió el id de la rúbrica creada.");
        }

        const toCreate = criteria.filter((c) => c.name.trim());

        if (toCreate.length === 0) {
            if (options?.requireCriteria) {
                throw new Error("Agrega al menos un criterio con nombre antes de continuar.");
            }
            return rubric;
        }

        let createdCount = 0;
        for (const criterion of toCreate) {
            try {
                await criterionService.createCriterion({
                    rubric_id: rubricId,
                    name: criterion.name.trim(),
                    description: nonEmptyText(criterion.description, "Sin descripción"),
                    weight: Number(criterion.weight),
                });
            } catch (err) {
                throw new Error(
                    getApiErrorMessage(
                        err,
                        `Error al guardar el criterio «${criterion.name.trim()}».`
                    )
                );
            }
            createdCount += 1;
        }

        if (createdCount === 0) {
            throw new Error("No se pudieron guardar los criterios en el servidor.");
        }

        return rubric;
    }
}

export function getRubricErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return getApiErrorMessage(error, "Error desconocido al guardar la rúbrica.");
}

export const rubricService = new RubricService();
