import axios from "axios";
import { User } from "../models/User";

const API_URL = import.meta.env.VITE_API_URL;

// Definimos la interfaz base para las respuestas del API
interface ApiResponse<T> {
    message?: string;
    data: T;
}

class UserService {
    async getTeacherById(id: string): Promise<User | null> {
        try {
            // Se asume que el id deberia usarse en vez de tener '90001' quemado,
            // pero mantenemos la estructura actual corrigiendo el tipado.
            const response = await axios.get<ApiResponse<User[]>>(
                `${API_URL}/academic/teachers/search?identification=${id}`
            );

            return response.data.data[0] ?? null;

        } catch (error) {
            console.error("Error al obtener profesores:", error);
            return null;
        }
    }
    
    async getUsers(): Promise<User[]> {
        try {
            // Se corrigio el endpoint a /users y el tipado de la respuesta
            const response = await axios.get<ApiResponse<User[]>>(`${API_URL}/users`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            return [];
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            const response = await axios.get<ApiResponse<User>>(`${API_URL}/users/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Usuario no encontrado:", error);
            return null;
        }
    }

    async createUser(user: Omit<User, "id">): Promise<User | null> {
        try {
            const response = await axios.post<ApiResponse<User>>(`${API_URL}/users`, user);
            return response.data.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return null;
        }
    }

    async updateUser(id: number, user: Partial<User>): Promise<User | null> {
        try {
            const response = await axios.put<ApiResponse<User>>(`${API_URL}/users/${id}`, user);
            return response.data.data;
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            return null;
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/users/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return false;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const userService = new UserService();
