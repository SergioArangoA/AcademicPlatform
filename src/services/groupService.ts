import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Group } from "../models/Groups/Group";
import { GroupsApiResponse } from "../models/Groups/GroupsApiResponse";
import { GroupApiResponse } from "../models/Groups/GroupApiResponse";
import { GroupPayload } from "../models/Groups/GroupPayload";
import { archiveGroupLocally, getArchivedGroupIds } from "../utils/groupArchiveStorage";

const API_URL = "/academic/groups";

interface Enrollment {
    id: string;
    group_id: string;
    status: string;
}

export interface GroupWithMeta extends Group {
    enrolled_count: number;
    available_capacity: number;
    is_archived_local: boolean;
}

class GroupService {
    private async fetchEnrollments(): Promise<Enrollment[]> {
        try {
            const response = await api.get<{ data: Enrollment[] }>("/academic/enrollments");
            return response.data.data ?? [];
        } catch {
            return [];
        }
    }

    private enrichGroups(groups: Group[], enrollments: Enrollment[]): GroupWithMeta[] {
        const archived = getArchivedGroupIds();
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
                is_archived_local: archived.has(String(group.id)),
            };
        });
    }

    async getGroups(): Promise<Group[]> {
        try {
            const response = await api.get<GroupsApiResponse>(API_URL);
            return response.data.data ?? [];
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }

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

    async createGroup(payload: GroupPayload): Promise<Group> {
        const response = await api.post<GroupApiResponse>(API_URL, payload);
        return response.data.data;
    }

    async updateGroup(groupId: string, payload: Partial<GroupPayload>): Promise<Group> {
        const response = await api.put<GroupApiResponse>(`${API_URL}/${groupId}`, payload);
        return response.data.data;
    }

    async archiveGroupLocally(groupId: string): Promise<void> {
        archiveGroupLocally(groupId);
    }

    async assignTeacherToGroup(groupId: string, teacherId: string): Promise<boolean> {
        try {
            await api.patch(`${API_URL}/${groupId}/assign-teacher/${teacherId}`);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al asignar docente:", error.response?.data || error.message);
            }
            return false;
        }
    }

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
