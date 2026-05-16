import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Grade } from "../models/Evaluation/Grade";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

const API_URL = "/evaluation/grades";

export type GradeStatus = "DRAFT" | "SENT";

export interface GradeDetailInput {
    scale_id: string;
    comment?: string;
}

export interface GradeStudentPayload {
    enrollment_id: string;
    evaluation_id?: string;
    rubric_id?: string;
    status: GradeStatus;
    final_score?: number;
    observations?: string;
    details: GradeDetailInput[];
}

export interface RegisterFinalScoreRow {
    enrollment_id: string;
    student_id: string;
    official_final_score: number;
    evaluations_count: number;
}

export interface ConfirmGroupPayload {
    group_id: string;
    semester_id?: string;
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

    async getGradesByEvaluation(evaluationId: string): Promise<Grade[]> {
        const all = await this.getGrades();
        return all.filter(
            (g) =>
                String(g.evaluation_id) === String(evaluationId) ||
                (!g.evaluation_id && g.rubric_id)
        );
    }

    async getGradesByGroup(_groupId: string, evaluationIds: string[], rubricIds: string[]): Promise<Grade[]> {
        const all = await this.getGrades();
        return all.filter(
            (g) =>
                (g.evaluation_id && evaluationIds.includes(String(g.evaluation_id))) ||
                rubricIds.includes(String(g.rubric_id))
        );
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
        rubricId: string,
        evaluationId?: string
    ): Promise<Grade | null> {
        const grades = await this.getGrades();
        return (
            grades.find((g) => {
                if (String(g.enrollment_id) !== String(enrollmentId)) return false;
                if (evaluationId && g.evaluation_id) {
                    return String(g.evaluation_id) === String(evaluationId);
                }
                return String(g.rubric_id) === String(rubricId);
            }) ?? null
        );
    }

    async gradeStudent(payload: GradeStudentPayload): Promise<Grade> {
        const response = await api.post<ApiEnvelope<Grade>>(API_URL, payload);
        return unwrapApiData(response);
    }

    async updateGrade(gradeId: string, payload: GradeStudentPayload): Promise<Grade> {
        const response = await api.patch<ApiEnvelope<Grade>>(`${API_URL}/${gradeId}`, payload);
        return unwrapApiData(response);
    }

    async saveGrade(payload: GradeStudentPayload, existingGradeId?: string): Promise<Grade> {
        if (existingGradeId) {
            return this.updateGrade(existingGradeId, payload);
        }
        return this.gradeStudent(payload);
    }

    async registerFinalScores(groupId: string): Promise<RegisterFinalScoreRow[]> {
        const response = await api.post<ApiEnvelope<RegisterFinalScoreRow[]>>(
            `/evaluation/groups/${groupId}/register-final-scores`
        );
        const data = unwrapApiData(response);
        return Array.isArray(data) ? data : [];
    }

    async confirmGroupOfficial(payload: ConfirmGroupPayload): Promise<void> {
        try {
            await api.patch(`${API_URL}/confirm-group`, payload);
        } catch {
            await this.registerFinalScores(payload.group_id);
        }
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
