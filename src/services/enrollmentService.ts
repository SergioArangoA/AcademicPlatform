import { api } from "../interceptors/authInterceptor";
import { Enrollment } from "../models/Enrollment";
import { ApiEnvelope } from "../types/ApiResponse";
import { studentInitials } from "../utils/evaluationFormat";
import { unwrapApiData } from "../utils/unwrapApiResponse";


const API_URL = "/academic/enrollments";

class EnrollmentService {
    async getEnrollments(groupId?: string): Promise<Enrollment[]> {
        try {
            const response = await api.get<ApiEnvelope<Enrollment[]>>(API_URL);
            let list = unwrapApiData(response);
            if (!Array.isArray(list)) list = [];
            if (groupId) {
                list = list.filter(
                    (e) => String(e.group_id) === String(groupId) && e.status === "ACTIVE"
                );
            }
            return list;
        } catch (error) {
            console.error("Error al obtener inscripciones:", error);
            return [];
        }
    }
    async getStudentEnrollments(studentId:string){
        try {
            const response = await api.get<ApiEnvelope<Enrollment[]>>(API_URL);
            let list = unwrapApiData(response);
            if (!Array.isArray(list)) list = [];
            if (studentId) {
                list = list.filter(
                    (enrollment) => String(enrollment.student_id) === String(studentId) && enrollment.status === "ACTIVE"
                );
            }
            return list;
        } catch (error) {
            console.error("Error al obtener inscripciones:", error);
            return [];
        }
    }
    async updateEnrollment(enrollment_id: string,enrollment: Enrollment){
        try {
            const response = await api.put<Enrollment>(`${API_URL}/${enrollment_id}`,enrollment);
            return response.data.data;
        } catch (error) {
            console.error("Error al actualizar la inscripción:", error);
            return [];
        }
    }
    async createEnrollment(enrollment: Omit<Enrollment, "id">): Promise<Enrollment | null> {
        try {
            const response = await api.post<Enrollment>(`${API_URL}`,enrollment);
            return response.data.data;
        } catch (error) {
            console.error("Error al crear inscripción:", error);
            return null;
        }
    }
}

export const enrollmentService = new EnrollmentService();
