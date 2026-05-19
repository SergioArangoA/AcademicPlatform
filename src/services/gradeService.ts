import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Grade, GradeStatus } from "../models/Evaluation/Grade";
import { GradeDetail } from "../models/Evaluation/GradeDetails";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/grades";

export type { GradeStatus };

/** Calificación guardada en borrador por el docente. */
export function isGradeDraft(status?: string | null): boolean {
    return status === "DRAFT";
}

/** Calificación publicada (visible para el estudiante). */
export function isGradeSent(status?: string | null): boolean {
    return status === "SENT";
}

/** Tiene nota registrada (borrador o enviada). */
export function isGradeRecorded(status?: string | null): boolean {
    return isGradeDraft(status) || isGradeSent(status);
}

export interface GradeDetailInput {
    scale_id: string;
    comment?: string;
}

export type { GradeDetail };

/**
 * POST /evaluation/grades — el backend calcula final_score.
 * Debe incluir enrollment_id y evaluation_id o rubric_id.
 */
export interface GradeStudentPayload {
    enrollment_id: string;
    evaluation_id?: string;
    rubric_id?: string;
    status: GradeStatus;
    observations?: string;
    details: GradeDetailInput[];
}

class GradeService {
    async getGrades(): Promise<Grade[]> {
        try {
            const response = await api.get<ApiEnvelope<Grade[]>>(API_URL);
            const list = unwrapApiData(response);
            return Array.isArray(list) ? list : [];
        } catch (error) {
            console.error("Error al obtener notas:", error);
            return [];
        }
    }

    /** Notas vinculadas a la rúbrica de una evaluación (Grade usa rubric_id, no evaluation_id). */
    async getGradesByRubricId(rubricId: string): Promise<Grade[]> {
        if (!rubricId) return [];
        const all = await this.getGrades();
        return all.filter((g) => String(g.rubric_id) === String(rubricId));
    }

    /** @deprecated Usar getGradesByRubricId con evaluation.rubric_id */
    async getGradesByEvaluation(_evaluationId: string, rubricId?: string | null): Promise<Grade[]> {
        return this.getGradesByRubricId(rubricId ? String(rubricId) : "");
    }

    async getGradesByGroup(_groupId: string, _evaluationIds: string[], rubricIds: string[]): Promise<Grade[]> {
        const rubricSet = new Set(rubricIds.map(String));
        const all = await this.getGrades();
        return all.filter((g) => g.rubric_id != null && rubricSet.has(String(g.rubric_id)));
    }

    async getGradeById(id: string): Promise<Grade | null> {
        try {
            const response = await api.get<ApiEnvelope<Grade>>(`${API_URL}/${id}`);
            return unwrapApiData(response);
        } catch (error) {
            console.error("Nota no encontrada:", error);
            return null;
        }
    }

    async findGradeForEnrollment(
        enrollmentId: string,
        rubricId: string
    ): Promise<Grade | null> {
        if (!enrollmentId || !rubricId) return null;
        const grades = await this.getGrades();
        return (
            grades.find(
                (g) =>
                    String(g.enrollment_id) === String(enrollmentId) &&
                    String(g.rubric_id) === String(rubricId)
            ) ?? null
        );
    }

    async gradeStudent(payload: GradeStudentPayload): Promise<Grade> {
        if (!payload.evaluation_id && !payload.rubric_id) {
            throw new Error("Se requiere evaluation_id o rubric_id para calificar.");
        }

        const body: GradeStudentPayload = {
            enrollment_id: payload.enrollment_id,
            status: payload.status,
            details: payload.details,
        };
        if (payload.evaluation_id) body.evaluation_id = payload.evaluation_id;
        if (payload.rubric_id) body.rubric_id = payload.rubric_id;
        if (payload.observations?.trim()) body.observations = payload.observations.trim();

        const response = await api.post<ApiEnvelope<Grade>>(API_URL, body);
        return unwrapApiData(response);
    }

    /** Upsert vía POST /grades (grade_student en el backend). */
    async saveGrade(payload: GradeStudentPayload): Promise<Grade> {
        return this.gradeStudent(payload);
    }

    /** PUT /evaluation/grades/:id — p. ej. pasar de DRAFT a SENT al publicar. */
    async updateGrade(
        gradeId: string,
        payload: { status?: GradeStatus; observations?: string | null }
    ): Promise<Grade> {
        const response = await api.put<ApiEnvelope<Grade>>(`${API_URL}/${gradeId}`, payload);
        return unwrapApiData(response);
    }
}

export function getGradeErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        return data?.message ?? error.message;
    }
    if (error instanceof Error) return error.message;
    return "Error al guardar la calificación.";
}

export const gradeService = new GradeService();

