/**
 * API de rúbricas (CU-08 / CU-09) — Postman `Rubrics`:
 * POST   /api/evaluation/rubrics — { title, description, is_public, is_archived }
 * GET    /api/evaluation/rubrics
 * PUT    /api/evaluation/rubrics/:id
 * PATCH  /api/evaluation/rubrics/:id/publish
 * GET    /api/evaluation/rubrics/search?title=...
 * La asignatura va en Evaluación (subject_id + group_id + rubric_id).
 */
import { api } from "../interceptors/authInterceptor";
import { Rubric } from "../models/Evaluation/Rubric";
import { ApiEnvelope } from "../types/ApiResponse";
import { getApiErrorMessage, nonEmptyText } from "../utils/apiPayload";
import { unwrapApiData } from "../utils/unwrapApiResponse";
import { assertRubricEditable } from "../utils/rubricEditRules";
import { criterionService } from "./criterionService";

const API_URL = "/evaluation/rubrics";

export interface CreateRubricPayload {
    title: string;
    description: string;
    is_public: boolean;
    is_archived: boolean;
}

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
    async getRubrics(
        isPublic?: boolean,
        options?: { throwOnError?: boolean }
    ): Promise<Rubric[]> {
        try {
            const response = await api.get<ApiEnvelope<Rubric[]>>(API_URL);
            let list = unwrapApiData(response);
            if (!Array.isArray(list)) list = [];
            if (isPublic === true) list = list.filter((r) => r.is_public === true);
            if (isPublic === false) list = list.filter((r) => !r.is_public);
            return list;
        } catch (error) {
            console.error("Error al obtener rúbricas:", error);
            if (options?.throwOnError) throw error;
            return [];
        }
    }

    async searchRubrics(filters: { title?: string }): Promise<Rubric[]> {
        try {
            const response = await api.get<ApiEnvelope<Rubric[]>>(
                `${API_URL}/search`,
                { params: filters }
            );
            const list = unwrapApiData(response);
            return Array.isArray(list) ? list : [];
        } catch (error) {
            console.error("Error al buscar rúbricas:", error);
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
        const response = await api.post<ApiEnvelope<Rubric>>(
            API_URL,
            toCreateRubricBody(payload)
        );
        return unwrapApiData(response);
    }

    async updateRubric(
        rubricId: string,
        payload: Partial<CreateRubricPayload>
    ): Promise<Rubric> {
        const current = await this.getRubricById(rubricId);
        assertRubricEditable(current);

        const body: Partial<CreateRubricApiBody> = {};
        if (payload.title != null) body.title = payload.title.trim();
        if (payload.description != null) {
            body.description = nonEmptyText(payload.description, "Sin descripción");
        }
        if (payload.is_public != null) body.is_public = Boolean(payload.is_public);
        if (payload.is_archived != null) body.is_archived = Boolean(payload.is_archived);

        const response = await api.put<ApiEnvelope<Rubric>>(`${API_URL}/${rubricId}`, body);
        return unwrapApiData(response);
    }

    async publishRubric(rubricId: string): Promise<Rubric> {
        const response = await api.patch<ApiEnvelope<Rubric>>(`${API_URL}/${rubricId}/publish`);
        return unwrapApiData(response);
    }

    async deleteRubric(rubricId: string): Promise<void> {
        await api.delete(`${API_URL}/${rubricId}`);
    }

    async saveRubricWithCriteria(
        rubricPayload: CreateRubricPayload,
        criteria: CreateCriterionInput[],
        options?: {
            requireCriteria?: boolean;
            existingRubricId?: string;
            onRubricPersisted?: (rubric: Rubric) => void;
        }
    ): Promise<Rubric> {
        if (!rubricPayload.title?.trim()) {
            throw new Error("El título de la rúbrica es obligatorio.");
        }

        const draftPayload = { ...rubricPayload, is_public: false };
        let rubric: Rubric;

        try {
            if (options?.existingRubricId) {
                rubric = await this.updateRubric(options.existingRubricId, draftPayload);
            } else {
                rubric = await this.createRubric(draftPayload);
            }
        } catch (err) {
            const action = options?.existingRubricId ? "actualizar" : "crear";
            throw new Error(
                getApiErrorMessage(err, `Error al ${action} la rúbrica en el servidor.`)
            );
        }

        const rubricId = String(
            rubric.id ??
                (rubric as { rubric_id?: string }).rubric_id ??
                options?.existingRubricId ??
                ""
        );
        if (!rubricId || rubricId === "undefined") {
            throw new Error("El servidor no devolvió el id de la rúbrica.");
        }

        options?.onRubricPersisted?.({ ...rubric, id: rubricId });

        const toCreate = criteria.filter((c) => c.name.trim());

        if (toCreate.length === 0) {
            if (options?.requireCriteria) {
                throw new Error("Agrega al menos un criterio con nombre antes de continuar.");
            }
            return { ...rubric, id: rubricId };
        }

        if (options?.existingRubricId) {
            const existing = await criterionService.getCriteriaByRubricId(rubricId);
            if (existing.length > 0) {
                return { ...rubric, id: rubricId };
            }
        }

        for (const criterion of toCreate) {
            try {
                await criterionService.createCriterion({
                    rubric_id: rubricId,
                    name: criterion.name.trim(),
                    description: nonEmptyText(criterion.description, "Sin descripción"),
                    weight: Number(criterion.weight),
                });
            } catch (err) {
                const partial = new Error(
                    getApiErrorMessage(
                        err,
                        `La rúbrica se guardó en el servidor (id: ${rubricId}), pero falló el criterio «${criterion.name.trim()}».`
                    )
                ) as Error & { rubricId?: string };
                partial.rubricId = rubricId;
                throw partial;
            }
        }

        return { ...rubric, id: rubricId };
    }
}

/** Obtiene el id de la rúbrica aunque el API devuelva `id` o `rubric_id`. */
export function resolveRubricId(
    rubric: Partial<Rubric> | { rubric_id?: string } | null | undefined,
    fallback?: string
): string {
    const raw =
        (rubric && 'id' in rubric ? rubric.id : undefined) ??
        (rubric && 'rubric_id' in rubric ? rubric.rubric_id : undefined) ??
        fallback ??
        '';
    const id = String(raw).trim();
    if (!id || id === 'undefined' || id === 'null') return '';
    return id;
}

export function getRubricErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return getApiErrorMessage(error, "Error desconocido al guardar la rúbrica.");
}

export const rubricService = new RubricService();
