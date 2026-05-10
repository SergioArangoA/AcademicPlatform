import axios from "axios";
import { Career } from "../models/Careers/Career";
import { CareerPayload } from "../models/Careers/CareerPayload";
import { CareersApiResponse } from "../models/Careers/CareersApiResponse"
import { CareerApiResponse } from "../models/Careers/CareerApiResponse";

const API_URL = import.meta.env.VITE_API_URL + "/academic/careers/" || "";
const API_URL1 = import.meta.env.VITE_API_URL + "/academic/careers" || "";

class CareerService {
    async getCareers(): Promise<Career[]> {
        try {
            // El backend responde con un envelope { data, message }
            const response = await axios.get<CareersApiResponse>(API_URL1);
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

    async getCareerById(careerId: string): Promise<Career | null> {
        try {
            const response = await axios.get<CareerApiResponse>(`${API_URL}${careerId}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al obtener carrera por id:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al obtener carrera por id:', error);
            }
            return null;
        }
    }

    async createCareer(payload: CareerPayload): Promise<Career | null> {
        try {
            const response = await axios.post<CareerApiResponse>(API_URL1, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al crear carrera:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al crear carrera:', error);
            }
            return null;
        }
    }

    async updateCareer(careerId: string, payload: CareerPayload): Promise<Career | null> {
        try {
            const response = await axios.put<CareerApiResponse>(`${API_URL}${careerId}`, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al actualizar carrera:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al actualizar carrera:', error);
            }
            return null;
        }
    }
}

export const careerService = new CareerService();