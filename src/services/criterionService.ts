/**
 * API de criterios de rúbrica: los creo después de guardar la rúbrica (rubric_id, name, weight, etc.).
 * Uso unwrapApiData porque el backend devuelve { data: ... }.
 */
import { api } from "../interceptors/authInterceptor";
import { Criterion } from "../models/Evaluation/Criterion";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/criteria";

class CriterionService {
    async getCriteria(rubricId?: string): Promise<Criterion[]> {
        try {
            const response = await api.get<ApiEnvelope<Criterion[]>>(`${API_URL}`, {
                params: rubricId ? { rubric_id: rubricId } : undefined,
            });
            let list = unwrapApiData(response);

            if (!Array.isArray(list)) {
                list = [];
            }

            if (rubricId) {
                list = list.filter((c) => String(c.rubric_id) === String(rubricId));
            }

            return list;
        } catch (error) {
            console.error("Error al obtener criterios:", error);
            return [];
        }
    }

    async getCriteriaByRubricId(rubricId: string): Promise<Criterion[]> {
        return this.getCriteria(rubricId);
    }

    async getCriterionById(id: string): Promise<Criterion | null> {
        try {
            const response = await api.get<ApiEnvelope<Criterion>>(`${API_URL}/${id}`);
            return unwrapApiData(response);
        } catch (error) {
            console.error("Criterio no encontrado:", error);
            return null;
        }
    }
}

export const criterionService = new CriterionService();
export const criteriaService = criterionService;
