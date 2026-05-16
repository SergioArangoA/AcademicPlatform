import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import { Registration } from "../models/Registration";

const API_URL = "/academic/registrations";

class RegistrationService {
    async getRegistrations(): Promise<Registration[]> {
        try {
            const response = await api.get<Registration[]>(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener matrículas:", error);
            return [];
        }
    }

    async getRegistrationById(id: string): Promise<Registration | null> {
        try {
            const response = await api.get<Registration>(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Matrícula no encontrada:", error);
            return null;
        }
    }

    async createRegistration(registration: Omit<Registration, "id">): Promise<Registration | null> {
        try {
            const response = await api.post<Registration>(`${API_URL}`, registration);
            return response.data.data;
        } catch (error) {
            console.error("Error al crear matrícula:", error);
            return null;
        }
    }

    async updateRegistration(id: string, registration: Partial<Registration>): Promise<Registration | null> {
        try {
            const response = await axios.put<Registration>(`${API_URL}/${id}`, registration);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar matrícula:", error);
            return null;
        }
    }

    async deleteRegistration(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar matrícula:", error);
            return false;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const registrationService = new RegistrationService();