import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Teacher } from "../models/Teachers/Teacher";
import { TeachersApiResponse } from "../models/Teachers/TeachersApiResponse";

const API_URL = "/academic/teachers";

class TeacherService {
    async searchTeacher(identification: string): Promise<Teacher[]> {
        try {
            const response = await api.get<TeachersApiResponse>(`${API_URL}/search`, {
                params: {
                    identification,
                },
            });
            return response.data.data ?? [];
        } catch (error) {
            console.error("Error al buscar profesor:", error);
            return [];
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const teacherService = new TeacherService();
