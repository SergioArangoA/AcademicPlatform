import { api } from "../interceptors/authInterceptor";
import { Subject } from "../models/Subjects/Subject";
import { SubjectPayload } from "../models/Subjects/SubjectPayload";
import { SubjectApiResponse } from "../models/Subjects/SubjectApiResponse";
import { SubjectListApiResponse } from "../models/Subjects/SubjectListApiResponse";

const API_URL = "/academic/subjects";


class SubjectService {
    async getSubjects(): Promise<Subject[]> {
        try {
            const response = await api.get<SubjectListApiResponse>(API_URL);
            return response.data.data ?? [];
        } catch (error) {
            console.error("Error al obtener materias:", error);
            return [];
        }
    }

    async getSubjectById(id: number | string | null | undefined): Promise<Subject | null> {
        if (id === null || id === undefined) {
            return null;
        }

        try {
            const response = await api.get<SubjectApiResponse>(`${API_URL}/${id}`);
            return response.data.data ?? null;
        } catch (error) {
            console.error("Materia no encontrada:", error);
            return null;
        }
    }

    async createSubject(subject: SubjectPayload): Promise<Subject | null> {
        try {
            const response = await api.post<SubjectApiResponse>(API_URL, subject);
            return response.data.data ?? null;
        } catch (error) {
            console.error("Error al crear materia:", error);
            return null;
        }
    }

    async updateSubject(id: number | string, subject: SubjectPayload): Promise<Subject | null> {
        try {
            const response = await api.put<SubjectApiResponse>(`${API_URL}/${id}`, subject);
            return response.data.data ?? null;
        } catch (error) {
            console.error("Error al actualizar materia:", error);
            return null;
        }
    }

    async deleteSubject(id: number | string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar materia:", error);
            return false;
        }
    }
}

export const subjectService = new SubjectService();