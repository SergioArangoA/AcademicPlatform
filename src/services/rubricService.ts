import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Rubric } from "../models/Rubric";

const API_URL = "/evaluation/rubrics";

class RubricService {
    async getRubrics(): Promise<Rubric[]> {
        try {
            const response = await api.get<Rubric[]>(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener rúbricas:", error);
            return [];
        }
    }

    async getRubricById(id: string): Promise<Rubric | null> {
        try {
            const response = await api.get<Rubric>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Rúbrica no encontrada:", error);
            return null;
        }
    }

    async createFullRubric(payload: any): Promise<Rubric | null> {
        try {
            // 1. Crear Rúbrica
            const rubricResponse = await api.post('/evaluation/rubrics', {
                title: payload.title,
                description: payload.description,
                subject_id: payload.subject_id
            });
            const rubricData = rubricResponse.data.data;
            const rubricId = rubricData.id;

            // 2. Crear Criterios y Escalas
            for (const criterion of payload.criteria) {
                const critResponse = await api.post('/evaluation/criteria', {
                    rubric_id: rubricId,
                    name: criterion.name,
                    description: criterion.description,
                    weight: Number(criterion.weight)
                });
                const critId = critResponse.data.data.id;

                for (const scale of criterion.scales) {
                    await api.post('/evaluation/scales', {
                        criterion_id: critId,
                        name: scale.name,
                        description: scale.description,
                        value: Number(scale.value)
                    });
                }
            }

            // 3. Publicar si se requiere
            if (payload.is_public) {
                await api.patch(`/evaluation/rubrics/${rubricId}/publish`);
                rubricData.is_public = true;
            }

            return rubricData;
        } catch (error) {
            console.error("Error al crear la rúbrica completa:", error);
            throw error;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const rubricService = new RubricService();