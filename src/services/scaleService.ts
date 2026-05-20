import { api } from "../interceptors/authInterceptor";
import { Scale } from "../models/Evaluation/Scale";
import { ApiEnvelope } from "../types/ApiResponse";
import { coerceApiId, getApiErrorMessage, nonEmptyText } from "../utils/apiPayload";
import { unwrapApiData } from "../utils/unwrapApiResponse";
import { CreateScalePayload } from "../models/Services/CreateScalePayload";

const API_URL = "/evaluation/scales";

class ScaleService {
    async getScales(): Promise<Scale[]> {
        try {
            const response = await api.get<ApiEnvelope<Scale[]>>(API_URL);
            const list = unwrapApiData(response);
            return Array.isArray(list) ? list : [];
        } catch (error) {
            console.error("Error al obtener escalas:", error);
            return [];
        }
    }

    async getScalesByCriterionId(criterionId: string): Promise<Scale[]> {
        const all = await this.getScales();
        return all
            .filter((s) => String(s.criterion_id) === String(criterionId))
            .sort((a, b) => a.value - b.value);
    }

    async getScalesByRubricId(_rubricId: string, criterionIds: string[]): Promise<Scale[]> {
        const all = await this.getScales();
        const idSet = new Set(criterionIds.map(String));
        return all.filter((s) => idSet.has(String(s.criterion_id)));
    }

    async createScale(payload: CreateScalePayload): Promise<Scale> {
        const body: CreateScalePayload = {
            criterion_id: String(coerceApiId(payload.criterion_id)),
            name: payload.name.trim(),
            description: nonEmptyText(payload.description, "Sin descripción"),
            value: Number(payload.value),
        };
        const response = await api.post<ApiEnvelope<Scale>>(API_URL, body);
        return unwrapApiData(response);
    }

    async updateScale(scaleId: string, payload: Partial<CreateScalePayload>): Promise<Scale> {
        const response = await api.put<ApiEnvelope<Scale>>(`${API_URL}/${scaleId}`, payload);
        return unwrapApiData(response);
    }

    async deleteScale(scaleId: string): Promise<void> {
        await api.delete(`${API_URL}/${scaleId}`);
    }

    /** Clona escalas de un criterio origen a otro (CU-09 flujo alternativo). */
    async cloneScalesToCriterion(sourceCriterionId: string, targetCriterionId: string): Promise<Scale[]> {
        const source = await this.getScalesByCriterionId(sourceCriterionId);
        const created: Scale[] = [];
        for (const scale of source) {
            const copy = await this.createScale({
                criterion_id: targetCriterionId,
                name: scale.name,
                description: scale.description ?? "",
                value: scale.value,
            });
            created.push(copy);
        }
        return created;
    }
}

export function getScaleErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return getApiErrorMessage(error, "Error al guardar la escala.");
}

export const scaleService = new ScaleService();
