import { api } from "../interceptors/authInterceptor";
import { ApiEnvelope } from "../types/ApiResponse";
import { unwrapApiData } from "../utils/unwrapApiResponse";

export interface Enrollment {
    id: string;
    group_id: string;
    student_id: string;
    status: string;
}

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
}

export const enrollmentService = new EnrollmentService();
