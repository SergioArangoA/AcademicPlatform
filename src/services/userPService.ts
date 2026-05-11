import axios from "axios";
import { UserResponse } from "../models/Users/UserResponse";
import { UsersApiResponse } from "../models/Users/UsersApiResponse";
import { UserApiResponse } from "../models/Users/UserApiResponse";
import { UpdateUserPayload } from "../models/Users/UpdateUserPayload";
import extractApiMessage from "../utils/extractApiMessage";
import { UserMutationResult } from "../utils/userMutationResult";
import { api } from "../interceptors/authInterceptor";


const API_URL = "/users/";

class UserPService {
    async getUsers(): Promise<UserResponse[]> {
        try {
            // El backend responde con un envelope { data, message }
            const response = await api.get<UsersApiResponse>(API_URL);
            return response.data.data;
        } catch (error) {
            // Manejo de errores más descriptivo
            if (axios.isAxiosError(error)) {
                console.error("Error de la API:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado:", error);
            }
            return [];
        }
    }
    async getUserById(userId: string): Promise<UserResponse | null> {
        try {
            const response = await api.get<UserApiResponse>(`${API_URL}${userId}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al obtener usuario por id:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al obtener usuario por id:', error);
            }
            return null;
        }
    }

    async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserResponse | null> {
        try {
            const response = await api.put(`${API_URL}${userId}`, payload);
            
            // Manejar tanto envelope { data: ... } como respuesta directa
            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                return (response.data as any).data as UserResponse;
            }
            
            return response.data as UserResponse;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al actualizar usuario:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al actualizar usuario:', error);
            }
            return null;
        }
    }
    async deactivateUser(userId: string): Promise<boolean> {
        try {
            const response = await api.patch(`${API_URL}${userId}/deactivate`);
            return response.status >= 200 && response.status < 300;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al desactivar usuario:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al desactivar usuario:', error);
            }
            return false;
        }
    }

    private async registerPublicUser(
        endpoint: "public/register-teacher" | "public/register-student",
        payload: UpdateUserPayload,
    ): Promise<UserMutationResult> {
        try {
            const response = await api.post(`${API_URL}${endpoint}`, payload);

            if (response.data && typeof response.data === "object" && "data" in response.data) {
                const responsePayload = response.data as { data: UserResponse; message?: string };
                return {
                    success: true,
                    data: responsePayload.data,
                    message: responsePayload.message || "Usuario creado correctamente",
                };
            }

            return {
                success: true,
                data: response.data as UserResponse,
                message: "Usuario creado correctamente",
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message =
                    extractApiMessage(error.response?.data) ||
                    error.message ||
                    "No se pudo crear el usuario";

                console.error(`Error al registrar usuario (${endpoint}):`, error.response?.data || error.message);

                return {
                    success: false,
                    data: null,
                    message,
                };
            }

            console.error(`Error inesperado al registrar usuario (${endpoint}):`, error);

            return {
                success: false,
                data: null,
                message: "No se pudo crear el usuario",
            };
        }
    }

    async registerTeacher(payload: UpdateUserPayload): Promise<UserMutationResult> {
        return this.registerPublicUser("public/register-teacher", payload);
    }

    async registerStudent(payload: UpdateUserPayload): Promise<UserMutationResult> {
        return this.registerPublicUser("public/register-student", payload);
    }
    
}

export const userPService = new UserPService();