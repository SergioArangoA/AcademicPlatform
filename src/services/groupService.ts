/**
 * Aquí llamo al API de grupos (/academic/groups).
 *
 * Sergio dejó una base(listar). Yo armé lo de crear y editar grupos:
 * - Quité métodos que no tenían que ver (eran copia de usuarios) y puse crear/actualizar de verdad.
 * - Ajusté las respuestas porque el backend manda todo dentro de "data".
 * - En el listado muestro cuántos cupos quedan según las matrículas activas.
 * - Antes de guardar, reviso que el código del grupo no se repita en el mismo semestre.
 * - Si algo falla, devuelvo un mensaje claro para el SweetAlert.
 * - assignTeacherToGroup lo uso en otra pantalla (asignar docente), no al crear un grupo nuevo.
 */
import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Group } from "../models/Groups/Group";
import { GroupsApiResponse } from "../models/Groups/GroupsApiResponse";
import { GroupApiResponse } from "../models/Groups/GroupApiResponse";
import { GroupPayload } from "../models/Groups/GroupPayload";
const API_URL = "/academic/groups";

/** Matrículas para saber cuántos estudiantes ya están en cada grupo */
interface Enrollment {
    id: string;
    group_id: string;
    status: string;
}

/** Grupo con info extra para la tabla del admin (cupos según matrículas activas) */
export interface GroupWithMeta extends Group {
    enrolled_count: number;
    available_capacity: number;
}

class GroupService {
    /** Traigo las inscripciones para calcular cupos ocupados */
    private async fetchEnrollments(): Promise<Enrollment[]> {
        try {
            const response = await api.get<{ data: Enrollment[] }>("/academic/enrollments");
            return response.data.data ?? [];
        } catch {
            return [];
        }
    }

    /** Les sumo cupo disponible según inscripciones activas */
    private enrichGroups(groups: Group[], enrollments: Enrollment[]): GroupWithMeta[] {
        const countByGroup = new Map<string, number>();

        enrollments
            .filter((e) => e.status === "ACTIVE")
            .forEach((e) => {
                const key = String(e.group_id);
                countByGroup.set(key, (countByGroup.get(key) ?? 0) + 1);
            });

        return groups.map((group) => {
            const enrolled = countByGroup.get(String(group.id)) ?? 0;
            const capacity = group.capacity ?? 0;
            return {
                ...group,
                enrolled_count: enrolled,
                available_capacity: Math.max(0, capacity - enrolled),
            };
        });
    }

    /** Lista básica; la uso al crear para validar que el código no exista */
    async getGroups(): Promise<Group[]> {
        try {
            const response = await api.get<GroupsApiResponse>(API_URL);
            return response.data.data ?? [];
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }

    /** Lista con cupos para la pantalla de gestión de grupos */
    async getGroupsWithMeta(): Promise<GroupWithMeta[]> {
        try {
            const [groupsResponse, enrollments] = await Promise.all([
                api.get<GroupsApiResponse>(API_URL),
                this.fetchEnrollments(),
            ]);
            const groups = groupsResponse.data.data ?? [];
            return this.enrichGroups(groups, enrollments);
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }

    async getGroupById(id: string): Promise<GroupWithMeta | null> {
        try {
            const response = await api.get<GroupApiResponse>(`${API_URL}/${id}`);
            const enrollments = await this.fetchEnrollments();
            const enriched = this.enrichGroups([response.data.data], enrollments);
            return enriched[0] ?? null;
        } catch (error) {
            console.error("Grupo no encontrado:", error);
            return null;
        }
    }

    /** Guardar un grupo nuevo (pantalla "Nuevo grupo") */
    async createGroup(payload: GroupPayload): Promise<Group> {
        const response = await api.post<GroupApiResponse>(API_URL, payload);
        return response.data.data;
    }

    /** Actualizar un grupo ya existente */
    async updateGroup(groupId: string, payload: Partial<GroupPayload>): Promise<Group> {
        const response = await api.put<GroupApiResponse>(`${API_URL}/${groupId}`, payload);
        return response.data.data;
    }

    /** Cambiar docente en otra pantalla; no lo uso al crear el grupo */
    async assignTeacherToGroup(groupId: string, teacherId: string): Promise<void> {
        await api.patch(`${API_URL}/${groupId}/assign-teacher/${teacherId}`);
    }

    /** Mensaje amigable cuando falla guardar o editar */
    getErrorMessage(error: unknown): string {
        if (axios.isAxiosError(error)) {
            const data = error.response?.data as { message?: string } | undefined;
            return data?.message || error.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return "Ocurrió un error inesperado";
    }

    /** No permitir dos grupos con el mismo código en el mismo semestre */
    validateGroupCodeUniqueInSemester(
        groups: Group[],
        groupCode: string,
        semesterId: string,
        excludeGroupId?: string
    ): boolean {
        const code = groupCode.trim().toUpperCase();
        return !groups.some(
            (g) =>
                String(g.semester_id) === String(semesterId) &&
                (g.group_code ?? "").toUpperCase() === code &&
                String(g.id) !== String(excludeGroupId ?? "")
        );
    }
}

export const groupService = new GroupService();
