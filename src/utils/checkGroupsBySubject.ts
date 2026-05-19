/**
 * Verifica si existe un grupo para una asignatura en el semestre activo.
 * Se utiliza para evitar cambios de asignatura cuando tiene grupos asignados.
 */
import { api } from "../interceptors/authInterceptor";
import { semesterService } from "../services/semesterService";

interface GroupSearchResponse {
    data: Array<{ id: string | number }>;
}

/**
 * Busca grupos para una asignatura en el semestre activo.
 * @param subjectId - ID de la asignatura a buscar
 * @returns true si existe al menos un grupo para la asignatura en el semestre activo, false si no
 */
export const hasGroupsInActiveSpringterm = async (subjectId: string | number | undefined): Promise<boolean> => {
    try {
        if (!subjectId) {
            return false;
        }

        // Obtener todos los semestres
        const semesters = await semesterService.getSemesters();
        
        // Filtrar por el que tenga is_active = true
        const activeSemester = semesters.find((semester) => semester.is_active);

        if (!activeSemester || !activeSemester.id) {
            return false;
        }

        // Hacer la búsqueda de grupos
        const response = await api.get<GroupSearchResponse>(
            `/academic/groups/search?semester_id=${activeSemester.id}&subject_id=${subjectId}`
        );

        // Verificar si hay resultados
        const groups = response.data.data ?? [];
        return groups.length > 0;
    } catch (error) {
        console.error("Error al verificar grupos en asignatura:", error);
        // En caso de error, permitir la actualización (no es crítico)
        return false;
    }
};
