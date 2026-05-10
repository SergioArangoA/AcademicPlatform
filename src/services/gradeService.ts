import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Grade } from "../models/Grade";

const API_URL = "/evaluation/grades";

class GradeService {
    async getGrades(): Promise<Grade[]> {
        try {
            const response = await api.get<Grade[]>(`${API_URL}`);
            if (response.data.data.length > 0){
                return response.data.data;
            }
            return [
  {
    id: "g1",
    enrollment_id: "enr1",
    rubric_id: "5d84071e-96cd-4ae8-8141-31a0511f6103",
    status: "completed",
    observations: "Buen desempeño general",
    details: [
      {
        scale_id: "s1", // Knowledge - Excellent
        comment: "Domina completamente los conceptos",
      },
      {
        scale_id: "s5", // Application - Good
        comment: "Pequeños errores en la aplicación",
      },
      {
        scale_id: "s8", // Presentation - Good
        comment: "Claro, pero puede mejorar estructura",
      },
    ],
  },

  {
    id: "g2",
    enrollment_id: "enr2",
    rubric_id: "r1",
    status: "completed",
    observations: "Desempeño aceptable",
    details: [
      {
        scale_id: "s3", // Knowledge - Basic
        comment: "Conceptos parcialmente entendidos",
      },
      {
        scale_id: "s6", // Application - Basic
        comment: "Dificultades al aplicar",
      },
      {
        scale_id: "s9", // Presentation - Basic
        comment: "Difícil de seguir",
      },
    ],
  },

  {
    id: "g3",
    enrollment_id: "enr3",
    rubric_id: "r1",
    status: "in_progress",
    observations: "Evaluación en curso",
    details: [
      {
        scale_id: "s2", // Knowledge - Good
      },
      {
        scale_id: "s4", // Application - Excellent
      },
      {
        scale_id: "s7", // Presentation - Excellent
      },
    ],
  },

  {
    id: "g4",
    enrollment_id: "enr4",
    rubric_id: "r1",
    status: "pending",
    observations: "Aún no evaluado",
    details: [],
  },
];
        } catch (error) {
            console.error("Error al obtener notas:", error);
            return [];
        }
    }

    async getGradeById(id: string): Promise<Grade | null> {
        if (id === "g1"){
            return {
    id: "g1",
    enrollment_id: "enr1",
    rubric_id: "5d84071e-96cd-4ae8-8141-31a0511f6103",
    status: "completed",
    observations: "Buen desempeño general",
    details: [
      {
        scale_id: "s1", // Knowledge - Excellent
        comment: "Domina completamente los conceptos",
      },
      {
        scale_id: "s5", // Application - Good
        comment: "Pequeños errores en la aplicación",
      },
      {
        scale_id: "s8", // Presentation - Good
        comment: "Claro, pero puede mejorar estructura",
      },
    ],
  }
        }
        try {
            const response = await api.get<Grade>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Nota no encontrada:", error);
            return null;
        }
    }

    async createUser(user: Omit<User, "id">): Promise<User | null> {
        try {
            const response = await axios.post<User>(API_URL, user);
            return response.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return null;
        }
    }

    async updateUser(id: number, user: Partial<User>): Promise<User | null> {
        try {
            const response = await axios.put<User>(`${API_URL}/${id}`, user);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            return null;
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return false;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const gradeService = new GradeService();