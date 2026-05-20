/**
 * API de criterios de rúbrica: los creo después de guardar la rúbrica (rubric_id, name, weight, etc.).
 * El backend puede devolver rubrica_id / peso_porcentual / nombre — se normalizan al leer.
 */
import { api } from '../interceptors/authInterceptor';
import { Criterion } from '../models/Evaluation/Criterion';
import { ApiEnvelope } from '../types/ApiResponse';
import { coerceApiId, nonEmptyText } from '../utils/apiPayload';
import { unwrapApiData } from '../utils/unwrapApiResponse';
import {
  ensureCriteriaList,
  filterCriteriaByRubricId,
  normalizeCriterion,
} from '../utils/criterionWeight';
import { CreateCriterionApiPayload } from '../models/Services/CreateCriterionApiPayload';

const API_URL = '/evaluation/criteria';


class CriterionService {
  async getCriteria(rubricId?: string): Promise<Criterion[]> {
    try {
      const response = await api.get<ApiEnvelope<unknown>>(API_URL);
      const raw = unwrapApiData(response);
      const list = ensureCriteriaList(raw).map(normalizeCriterion);

      if (rubricId) {
        return filterCriteriaByRubricId(list, rubricId);
      }

      return list;
    } catch (error) {
      console.error('Error al obtener criterios:', error);
      return [];
    }
  }

  async getCriteriaByRubricId(rubricId: string): Promise<Criterion[]> {
    if (!rubricId) return [];
    return this.getCriteria(rubricId);
  }

  async getCriterionById(id: string): Promise<Criterion | null> {
    try {
      const response = await api.get<ApiEnvelope<unknown>>(`${API_URL}/${id}`);
      const raw = unwrapApiData(response);
      if (!raw || typeof raw !== 'object') return null;
      return normalizeCriterion(raw as Parameters<typeof normalizeCriterion>[0]);
    } catch (error) {
      console.error('Criterio no encontrado:', error);
      return null;
    }
  }

  async createCriterion(payload: CreateCriterionApiPayload): Promise<Criterion> {
    const body: CreateCriterionApiPayload = {
      rubric_id: String(coerceApiId(payload.rubric_id)),
      name: payload.name.trim(),
      description: nonEmptyText(payload.description, 'Sin descripción'),
      weight: Number(payload.weight),
    };

    const response = await api.post<ApiEnvelope<unknown>>(API_URL, body);
    const raw = unwrapApiData(response);
    if (!raw || typeof raw !== 'object') {
      throw new Error('El servidor no devolvió el criterio creado.');
    }
    return normalizeCriterion(raw as Parameters<typeof normalizeCriterion>[0]);
  }
}

export const criterionService = new CriterionService();
export const criteriaService = criterionService;
